export function updateTranscription(text) {
    const el = document.getElementById('user-text');
    const bubble = document.getElementById('user-bubble');
    if (el && bubble) {
        el.textContent = text;
        bubble.classList.remove('hidden');
    }
}

export function updateResponse(text, isEmergency) {
    const el = document.getElementById('ai-response');
    const bubble = document.getElementById('ai-bubble');
    if (el && bubble) {
        el.textContent = text;
        bubble.classList.remove('hidden');
        if (isEmergency) {
            bubble.classList.add('emergency');
        } else {
            bubble.classList.remove('emergency');
        }
    }
}

export function setMicState(isListening) {
    const micBtn = document.getElementById('mic-btn');
    const statusText = document.getElementById('status-text');
    if (micBtn) {
        if (isListening) {
            micBtn.classList.add('listening');
            if (statusText) statusText.textContent = "Listening...";
        } else {
            micBtn.classList.remove('listening');
            if (statusText) statusText.textContent = "Tap to speak";
        }
    }
}

// Screen router
export function switchScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('active');
    });

    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
}

export function showEmailForm() {
    const el = document.getElementById('email-form-container');
    if (el) {
        el.classList.remove('hidden');
        const input = document.getElementById('patient-email');
        if (input) setTimeout(() => input.focus(), 100);
    }
}

export function hideEmailForm() {
    const el = document.getElementById('email-form-container');
    if (el) {
        el.classList.add('hidden');
        const input = document.getElementById('patient-email');
        if (input) input.value = '';
    }
}

export function showBookingScreen(doctor) {
    if (!doctor) return;
    const nameEl = document.getElementById('booked-doctor-name');
    const deptEl = document.getElementById('booked-department');
    const timeEl = document.getElementById('booked-time');
    const notice = document.getElementById('booking-notice');

    if (nameEl) nameEl.textContent = doctor.name;
    if (deptEl) deptEl.textContent = doctor.department;
    if (timeEl) timeEl.textContent = doctor.available;
    if (notice) notice.textContent = `Confirmation emailed to you and ${doctor.name}.`;

    switchScreen('booking-screen');
}

export function goHome() {
    switchScreen('home-screen');
    // Reset chat bubbles
    const userBubble = document.getElementById('user-bubble');
    const aiBubble = document.getElementById('ai-bubble');
    if (userBubble) userBubble.classList.add('hidden');
    if (aiBubble) aiBubble.classList.add('hidden');
    hideEmailForm();
}
