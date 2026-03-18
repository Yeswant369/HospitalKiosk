const emergencyKeywords = [
  'chest pain', 'heart attack', 'bleeding', 'stroke', 'unconscious', 
  'emergency', 'accident', "can't breathe", 'breath', 'severe pain', 
  'seizure', 'fainting'
];

export function isEmergency(text) {
  const lowercaseText = text.toLowerCase();
  return emergencyKeywords.some(keyword => lowercaseText.includes(keyword));
}
