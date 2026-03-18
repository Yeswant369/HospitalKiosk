export function buildResponse(analysis, doctor, context) {
  if (analysis.warning === 'missing_key') {
    return 'I am currently unable to process your request because my semantic intelligence is offline. Please configure the VITE_GEMINI_API_KEY in your .env file to enable natural query processing.';
  }

  if (analysis.type === 'emergency') {
    return 'This sounds like a medical emergency. Please proceed immediately to the Emergency Room, or call emergency services right away. We are alerting our triage team.';
  }

  if (analysis.responseText) {
    return analysis.responseText;
  }

  // Pure fallback if Gemini didn't format responseText properly
  if (analysis.type === 'greeting') {
    return 'Hello! I am the AI Front Desk. How can I help you today? Please describe your symptoms and I will route you to the correct specialist.';
  }

  return "I understand. Let me help you with that.";
}
