import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpeechControls } from '../components/common/SpeechControls';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { AppProvider } from '../context/AppContext';

const speak = vi.fn();
const cancel = vi.fn();
const pause = vi.fn();
const resume = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  speak.mockClear();
  cancel.mockClear();
  pause.mockClear();
  resume.mockClear();

  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: {
      speak,
      cancel,
      pause,
      resume,
      getVoices: () => [],
      speaking: false,
      paused: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });
});

afterEach(() => {
  vi.useRealTimers();
});

function renderWithApp(ui: React.ReactNode) {
  return render(<AppProvider>{ui}</AppProvider>);
}

function setSpeechState(speaking: boolean, paused = false) {
  Object.defineProperty(window.speechSynthesis, 'speaking', {
    configurable: true,
    value: speaking,
  });
  Object.defineProperty(window.speechSynthesis, 'paused', {
    configurable: true,
    value: paused,
  });
}

describe('SpeechControls', () => {
  beforeEach(() => {
    setSpeechState(false, false);
  });

  it('renders playback controls and speed slider', () => {
    renderWithApp(<SpeechControls text="Hola mundo" label="Listen to passage" />);

    expect(screen.getByLabelText('Play passage audio')).toBeInTheDocument();
    expect(screen.getByLabelText('Pause passage audio')).toBeInTheDocument();
    expect(screen.getByLabelText('Stop and reset passage audio')).toBeInTheDocument();
    expect(screen.getByLabelText('Audio playback speed')).toBeInTheDocument();
    expect(screen.getByText('Listen to passage')).toBeInTheDocument();
  });

  it('starts playback when play is clicked', () => {
    renderWithApp(<SpeechControls text="Hola mundo" />);

    fireEvent.click(screen.getByLabelText('Play passage audio'));
    vi.advanceTimersByTime(50);

    expect(speak).toHaveBeenCalledTimes(1);
  });

  it('stops playback when reset is clicked while speaking', () => {
    setSpeechState(true);

    renderWithApp(<SpeechControls text="Hola mundo" />);
    fireEvent.click(screen.getByLabelText('Stop and reset passage audio'));

    expect(cancel).toHaveBeenCalled();
  });

  it('can play again after stop even when the browser keeps speaking=true', () => {
    setSpeechState(true);

    renderWithApp(<SpeechControls text="Hola mundo" />);
    fireEvent.click(screen.getByLabelText('Stop and reset passage audio'));

    cancel.mockClear();
    speak.mockClear();
    setSpeechState(true);

    fireEvent.click(screen.getByLabelText('Play passage audio'));
    vi.advanceTimersByTime(50);

    expect(cancel).toHaveBeenCalled();
    expect(speak).toHaveBeenCalled();
  });
});

describe('ThemeToggle', () => {
  it('switches between light and dark mode', () => {
    renderWithApp(<ThemeToggle />);

    const toggle = screen.getByRole('button', { name: /Switch to/i });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-label', 'Switch to light mode');
  });
});
