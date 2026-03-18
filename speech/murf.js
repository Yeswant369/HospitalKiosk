// Reliable TTS using browser Speech Synthesis
// The key fix: we return a Promise that resolves when speech ends,
// and we keep a persistent global reference to prevent garbage collection.

export function speakResponse(text) {
  return new Promise((resolve) => {
    if (!text || !text.trim()) { resolve(); return; }

    if (!('speechSynthesis' in window)) {
      console.warn("Speech Synthesis not supported.");
      resolve();
      return;
    }

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Select a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Samantha') ||
      v.name.includes('Karen') ||
      v.name.includes('Google US English') ||
      v.name.includes('Daniel')
    );
    if (preferred) utterance.voice = preferred;

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => { console.warn("TTS Error:", e); resolve(); };

    // CRITICAL: Prevent Chrome garbage collection from killing the utterance
    window.__currentUtterance = utterance;

    window.speechSynthesis.speak(utterance);

    // Chrome bug workaround: resume synthesis if it pauses itself
    const resumeInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(resumeInterval);
      } else {
        window.speechSynthesis.resume();
      }
    }, 5000);

    utterance.onend = () => { clearInterval(resumeInterval); resolve(); };
  });
}
