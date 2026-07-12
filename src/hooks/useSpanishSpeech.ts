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

export function useSpanishSpeech(text: string, rate: number = DEFAULT_SPEECH_RATE) {
  const supported = useSpeechSupported();
  const [state, setState] = useState<SpeechPlaybackState>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const rateRef = useRef(rate);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  const syncState = useCallback(() => {
    const synthesis = window.speechSynthesis;
    if (!synthesis) return;

    if (synthesis.speaking && synthesis.paused) {
      setState('paused');
      return;
    }

    if (synthesis.speaking) {
      setState('speaking');
      return;
    }

    setState('idle');
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setState('idle');
  }, [supported]);

  const play = useCallback(() => {
    if (!supported || !text.trim()) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setState('speaking');
      return;
    }

    if (window.speechSynthesis.speaking) return;

    window.speechSynthesis.cancel();

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
    window.speechSynthesis.speak(utterance);
    setState('speaking');
  }, [supported, text]);

  const pause = useCallback(() => {
    if (!supported || !window.speechSynthesis.speaking || window.speechSynthesis.paused) return;
    window.speechSynthesis.pause();
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
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  useEffect(() => {
    stop();
  }, [text, stop]);

  useEffect(() => {
    if (!supported || state === 'idle') return;

    const interval = window.setInterval(syncState, 250);
    return () => window.clearInterval(interval);
  }, [supported, state, syncState]);

  return {
    supported,
    state,
    play,
    pause,
    stop,
    canPlay: Boolean(text.trim()),
    canPause: state === 'speaking',
    canStop: state === 'speaking' || state === 'paused',
  };
}
