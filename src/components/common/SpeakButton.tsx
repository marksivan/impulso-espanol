import { useApp } from '../../context/AppContext';
import { DEFAULT_SPEECH_RATE, useSpanishSpeech } from '../../hooks/useSpanishSpeech';

interface SpeakButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export { useSpeechSupported } from '../../hooks/useSpanishSpeech';

export function SpeakButton({
  text,
  label = 'Listen to Spanish sentence',
  className = '',
}: SpeakButtonProps) {
  const { settings } = useApp();
  const rate = settings.speechRate ?? DEFAULT_SPEECH_RATE;
  const { supported, state, play } = useSpanishSpeech(text, rate);

  if (!supported) return null;

  const isActive = state === 'speaking' || state === 'paused';

  return (
    <button
      type="button"
      onClick={play}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-border)] transition-colors shrink-0 ${
        isActive ? 'opacity-70' : ''
      } ${className}`}
      disabled={isActive && state === 'speaking'}
    >
      <span aria-hidden="true">{isActive ? '🔊' : '🔈'}</span>
    </button>
  );
}
