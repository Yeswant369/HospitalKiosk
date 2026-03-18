import { SpeechService } from './speech/speech.js';
import { speakResponse } from './speech/murf.js';
import { analyzeIntentAndSymptom } from './ai/symptomAnalysis.js';
import { buildResponse } from './ai/responseBuilder.js';
import { isEmergency } from './utils/emergency.js';
import { getDoctorByDepartment } from './data/doctors.js';
import { sendEmail } from './utils/email.js';
import {
    updateTranscription, updateResponse, setMicState,
    showBookingScreen, switchScreen, goHome,
    showEmailForm, hideEmailForm
} from './components/ui.js';

let currentContext = {
    lastDoctor: null,
    lastDepartment: null,
    awaitingConfirmation: false,
    awaitingEmail: false,
    userEmail: null
};

// ─── Email Submit Handler ────────────────────────────
function submitEmailAndBook() {
    const inputEl = document.getElementById('patient-email');
    if (!inputEl || !inputEl.value) return;

    currentContext.userEmail = inputEl.value;
    currentContext.awaitingConfirmation = false;
    currentContext.awaitingEmail = false;

    hideEmailForm();
    showBookingScreen(currentContext.lastDoctor);

    if (currentContext.lastDoctor) {
        sendEmail(currentContext.userEmail, currentContext.lastDoctor);
    }
}

// ─── Init ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Pre-load voices immediately
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }

    const micBtn = document.getElementById('mic-btn');
    if (!micBtn) return;

    const speechService = new SpeechService(
        () => {
            hideEmailForm();
            setMicState(true);
            updateTranscription("Listening...");

            // Hide previous AI response
            const aiBubble = document.getElementById('ai-bubble');
            if (aiBubble) aiBubble.classList.add('hidden');
        },
        (transcript) => {
            updateTranscription(transcript);
            processInteraction(transcript);
        },
        (err) => {
            console.error("Speech error:", err);
            setMicState(false);
            if (err !== 'no-speech') {
                updateTranscription("Couldn't hear you. Try again.");
            }
        },
        () => setMicState(false)
    );

    // ─── Mic Click ──────────────────────────────
    micBtn.addEventListener('click', () => {
        // Cancel any ongoing TTS
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        speechService.start();
    });

    // ─── Home Return Buttons ────────────────────
    document.querySelectorAll('.home-return-btn').forEach(btn =>
        btn.addEventListener('click', goHome)
    );

    // ─── Email Submit ───────────────────────────
    const submitEmailBtn = document.getElementById('submit-email-btn');
    if (submitEmailBtn) {
        submitEmailBtn.addEventListener('click', submitEmailAndBook);
    }

    // ─── Quick Action Buttons ───────────────────
    document.querySelectorAll('.qa-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'pharmacy') {
                switchScreen('pharmacy-screen');
                speakResponse("Here is the current pharmacy stock.");
            } else if (action === 'blood') {
                switchScreen('blood-screen');
                speakResponse("Here is the blood bank availability.");
            } else if (action === 'appointment') {
                updateTranscription("I want to book an appointment");
                processInteraction("I want to book an appointment");
            }
        });
    });
});

// ─── Core Interaction Logic ──────────────────────────
async function processInteraction(transcript) {
    try {
        // 1. Emergency check (fast path)
        const emergencyCase = isEmergency(transcript);
        if (emergencyCase) {
            const doctor = getDoctorByDepartment('emergency');
            const responseText = buildResponse({ type: 'emergency' }, doctor, currentContext);
            currentContext.lastDoctor = doctor;
            currentContext.lastDepartment = 'emergency';
            currentContext.awaitingConfirmation = false;

            updateResponse(responseText, true);
            document.body.classList.add('emergency-pulse');
            setTimeout(() => document.body.classList.remove('emergency-pulse'), 4000);

            await speakResponse(responseText);
            return;
        }

        // 2. Gemini semantic analysis
        const analysis = await analyzeIntentAndSymptom(transcript, currentContext);

        // 3. Doctor assignment for symptom intents
        let doctor = currentContext.lastDoctor;
        if (analysis.type === 'symptom' || analysis.type === 'unknown') {
            doctor = getDoctorByDepartment(analysis.department);
            currentContext.lastDoctor = doctor;
            currentContext.lastDepartment = analysis.department;
            currentContext.awaitingConfirmation = true;
        }

        // 4. Build response
        const responseText = buildResponse(analysis, doctor, currentContext);

        // 5. Handle screen routing by intent
        if (analysis.type === 'ask_email') {
            currentContext.awaitingConfirmation = false;
            currentContext.awaitingEmail = true;
            showEmailForm();
        }
        else if (analysis.type === 'book_appointment') {
            currentContext.awaitingConfirmation = false;
            currentContext.awaitingEmail = false;
            currentContext.userEmail = analysis.email;
            hideEmailForm();
            showBookingScreen(currentContext.lastDoctor);
            if (analysis.email) {
                sendEmail(analysis.email, currentContext.lastDoctor);
            }
        }
        else if (analysis.type === 'cancel') {
            currentContext.awaitingConfirmation = false;
            currentContext.awaitingEmail = false;
        }
        else if (analysis.type === 'blood_bank') {
            switchScreen('blood-screen');
        }
        else if (analysis.type === 'pharmacy') {
            switchScreen('pharmacy-screen');
        }

        // 6. Update chat UI
        updateResponse(responseText, false);

        // 7. Speak the response
        await speakResponse(responseText);

    } catch (e) {
        console.error("Processing error:", e);
        updateResponse("Sorry, something went wrong. Please try again.", false);
        await speakResponse("Sorry, something went wrong. Please try again.");
    }
}
