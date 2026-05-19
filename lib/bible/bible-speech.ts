/** Langue Web Speech à partir du code version (`fr`, `en`, `nl`). */
export function speechLangForBible(language: string): string {
  if (language === "fr") return "fr-FR";
  if (language === "nl") return "nl-NL";
  return "en-US";
}

export function pickSpeechVoice(langTag: string): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !window.speechSynthesis) return undefined;
  const voices = window.speechSynthesis.getVoices();
  const prefix = langTag.slice(0, 2).toLowerCase();
  return (
    voices.find((v) => v.lang.replace("_", "-").toLowerCase().startsWith(prefix)) ??
    voices.find((v) => v.lang.toLowerCase().includes(prefix)) ??
    voices[0]
  );
}

export function waitForSpeechVoices(timeoutMs = 2000): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]);
      return;
    }
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      clearTimeout(timer);
      resolve(window.speechSynthesis.getVoices());
    };
    const onChange = () => done();
    const timer = setTimeout(done, timeoutMs);
    window.speechSynthesis.addEventListener("voiceschanged", onChange);
  });
}
