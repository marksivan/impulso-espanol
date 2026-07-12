import { useCallback, useEffect, useRef, useState } from 'react';

export const DEFAULT_SPEECH_RATE = 0.75;
export const MIN_SPEECH_RATE = 0.5;
export const MAX_SPEECH_RATE = 1.25;

export type SpeechPlaybackState = 'idle' | 'speaking' | 'paused';

export function useSpeechSupported(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  return supported;
}

function pickSpanishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find(
    (voice) =>
      voice.lang.startsWith('es-ES') || voice.lang.startsWith('es-MX') || voice.lang.startsWith('es'),
  );
}

function resetSpeechSynthesis(): void {
  const synthesis = window.speechSynthesis;
  synthesis.cancel();
  // Chrome can keep `speaking === true` after cancel; a second cancel on the next tick clears it.
  window.setTimeout(() => synthesis.cancel(), 0);
}

export function useSpanishSpeech(text: string, rate: number = DEFAULT_SPEECH_RATE) {
  const supported = useSpeechSupported();
  const [state, setState] = useState<SpeechPlaybackState>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const rateRef = useRef(rate);
  const stateRef = useRef<SpeechPlaybackState>('idle');

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const stop = useCallback(() => {
    if (!supported) return;
    resetSpeechSynthesis();
    utteranceRef.current = null;
    setState('idle');
  }, [supported]);

  const startUtterance = useCallback(() => {
    if (!supported || !text.trim()) return;

    resetSpeechSynthesis();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = rateRef.current;

    const spanishVoice = pickSpanishVoice();
    if (spanishVoice) utterance.voice = spanishVoice;

    utterance.onend = () => {
      utteranceRef.current = null;
      setState('idle');
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setState('idle');
    };

    utteranceRef.current = utterance;

    // A short delay after cancel helps browsers restart the speech queue reliably.
    window.setTimeout(() => {
      window.speechSynthesis.speak(utterance);
      setState('speaking');
    }, 50);
  }, [supported, text]);

  const play = useCallback(() => {
    if (!supported || !text.trim()) return;

    const synthesis = window.speechSynthesis;

    if (stateRef.current === 'paused' && synthesis.paused) {
      synthesis.resume();
      setState('speaking');
      return;
    }

    startUtterance();
  }, [supported, text, startUtterance]);

  const pause = useCallback(() => {
    if (!supported || stateRef.current !== 'speaking') return;

    const synthesis = window.speechSynthesis;
    if (!synthesis.speaking) {
      setState('idle');
      return;
    }

    synthesis.pause();
    setState('paused');
  }, [supported]);

  useEffect(() => {
    if (!supported) return;

    const handleVoicesChanged = () => {
      if (utteranceRef.current && !utteranceRef.current.voice) {
        const spanishVoice = pickSpanishVoice();
        if (spanishVoice) utteranceRef.current.voice = spanishVoice;
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resetSpeechSynthesis();
    };
  }, [supported]);

  useEffect(() => {
    stop();
  }, [text, stop]);

  return {
    supported,
    state,
    play,
    pause,
    stop,
    canPlay: Boolean(text.trim()) && state !== 'speaking',
    canPause: state === 'speaking',
    canStop: state === 'speaking' || state === 'paused',
  };
}
