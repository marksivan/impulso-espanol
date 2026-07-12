import { useCallback, useEffect, useState } from 'react';

interface SpeakButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function useSpeechSupported(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  return supported;
}

export function SpeakButton({
  text,
  label = 'Listen to Spanish sentence',
  className = '',
}: SpeakButtonProps) {
  const supported = useSpeechSupported();
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(() => {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(
      (v) => v.lang.startsWith('es-ES') || v.lang.startsWith('es-MX') || v.lang.startsWith('es'),
    );
    if (spanishVoice) utterance.voice = spanishVoice;

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [supported, text]);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-border)] transition-colors shrink-0 ${className}`}
      disabled={speaking}
    >
      <span aria-hidden="true">{speaking ? '🔊' : '🔈'}</span>
    </button>
  );
}
