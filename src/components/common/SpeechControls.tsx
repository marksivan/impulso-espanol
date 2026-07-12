import { useApp } from '../../context/AppContext';
import {
  DEFAULT_SPEECH_RATE,
  MAX_SPEECH_RATE,
  MIN_SPEECH_RATE,
  useSpanishSpeech,
} from '../../hooks/useSpanishSpeech';

interface SpeechControlsProps {
  text: string;
  label?: string;
  className?: string;
}

function controlButtonClass(disabled: boolean): string {
  return `inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-colors shrink-0 ${
    disabled
      ? 'opacity-40 cursor-not-allowed'
      : 'hover:bg-[var(--color-border)] cursor-pointer'
  }`;
}

export function SpeechControls({
  text,
  label = 'Listen to passage',
  className = '',
}: SpeechControlsProps) {
  const { settings, updateSettings } = useApp();
  const rate = settings.speechRate ?? DEFAULT_SPEECH_RATE;
  const { supported, state, play, pause, stop, canPlay, canPause, canStop } = useSpanishSpeech(
    text,
    rate,
  );

  if (!supported) return null;

  const playLabel = state === 'paused' ? 'Resume passage audio' : 'Play passage audio';

  return (
    <div
      className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] ${className}`}
      role="group"
      aria-label={label}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={play}
          disabled={!canPlay}
          aria-label={playLabel}
          title={playLabel}
          className={controlButtonClass(!canPlay)}
        >
          <span aria-hidden="true">{state === 'paused' ? '▶️' : '🔈'}</span>
        </button>
        <button
          type="button"
          onClick={pause}
          disabled={!canPause}
          aria-label="Pause passage audio"
          title="Pause"
          className={controlButtonClass(!canPause)}
        >
          <span aria-hidden="true">⏸️</span>
        </button>
        <button
          type="button"
          onClick={stop}
          disabled={!canStop}
          aria-label="Stop and reset passage audio"
          title="Stop and reset"
          className={controlButtonClass(!canStop)}
        >
          <span aria-hidden="true">⏹️</span>
        </button>
      </div>

      <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] min-w-[10rem] flex-1">
        <span className="whitespace-nowrap">Speed</span>
        <input
          type="range"
          min={MIN_SPEECH_RATE}
          max={MAX_SPEECH_RATE}
          step={0.05}
          value={rate}
          onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })}
          aria-label="Audio playback speed"
          className="flex-1 accent-[var(--color-accent)]"
        />
        <span className="tabular-nums w-10 text-right">{rate.toFixed(2)}×</span>
      </label>

      <span className="text-xs text-[var(--color-text-muted)] w-full sm:w-auto">{label}</span>
    </div>
  );
}
