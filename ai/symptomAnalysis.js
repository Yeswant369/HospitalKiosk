import { GoogleGenerativeAI } from "@google/generative-ai";
import { doctors } from '../data/doctors.js';

let genAI = null;

export async function analyzeIntentAndSymptom(text, context) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing VITE_GEMINI_API_KEY in .env file! Please add it for semantic matching to work.");
    // Fallback response so the app doesn't crash completely, but warns the user
    return { type: 'unknown', department: 'general', warning: 'missing_key' };
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }

  try {
    return await analyzeWithGemini(text, context);
  } catch (err) {
    console.error("Gemini Semantic API Error:", err);
    return { type: 'unknown', department: 'general' };
  }
}

async function analyzeWithGemini(text, context) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are an advanced AI Hospital Receptionist. 
Analyze the user's natural query semantically: "${text}"

Hospital Database (Doctors):
${JSON.stringify(doctors)}

Current Conversation Context:
- Awaiting Confirmation for Appointment: ${context?.awaitingConfirmation ? 'Yes' : 'No'}
- Awaiting Email for Appointment: ${context?.awaitingEmail ? 'Yes' : 'No'}
- Last Doctor Assigned: ${context?.lastDoctor ? JSON.stringify(context.lastDoctor) : 'None'}
- Last Department Assigned: ${context?.lastDepartment || 'None'}

Your job is to generate BOTH the required system intent AND a natural, conversational response to speak to the patient.

Available System Intents:
- "ask_email": if we are awaiting confirmation and they definitively say yes/book it, but we don't have their email yet. Respond by asking them to precisely type their email address in the input box below.
- "book_appointment": IF we are currently awaiting their email address (Awaiting Email: Yes), and they happen to speak an email address anyway. Extract their email and format the response to confirm the booking to that email.
- "cancel": if they say no to booking.
- "general_info": if they ask general hospital questions.
- "availability": if they follow up asking about timing or different doctors. If they ask for times other than what the doctor has available, politely inform them that this is the only slot left for this doctor today.
- "greeting": simple greetings.
- "blood_bank": questions about blood donation or receiving.
- "pharmacy": questions about medicines.
- "symptom": if they describe a symptom. Identify the department (cardiology, neurology, general, orthopedics, dermatology, pediatrics).
- "emergency": if it's life-threatening (chest pain, stroke, severe bleeding).
- "unknown": completely unrelated.

Return ONLY a valid JSON object with the following structure:
{
  "type": "<one_of_the_intents_above>",
  "department": "<department_if_applicable_or_null>",
  "email": "<extracted_email_if_they_provided_one_or_null>",
  "responseText": "<Your natural, empathetic, AI-generated conversational response to the user>"
}

IMPORTANT: Respond ONLY with the raw JSON object. Do not format with markdown blocks like \`\`\`json.
JSON Output:`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(responseText);
}
