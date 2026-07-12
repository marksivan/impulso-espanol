import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PassageReader } from '../components/lessons/PassageReader';
import { AppProvider } from '../context/AppContext';
import { a12Lessons } from '../data/lessons/a12Lessons';

const translateText = vi.fn();

vi.mock('../services/translationService', () => ({
  translateText: (...args: unknown[]) => translateText(...args),
}));

function renderPassageReader() {
  return render(
    <AppProvider>
      <PassageReader lesson={a12Lessons[0]} />
    </AppProvider>,
  );
}

describe('PassageReader translations', () => {
  beforeEach(() => {
    translateText.mockReset();
    translateText.mockResolvedValue({
      sourceText: 'Daniel es estudiante',
      translatedText: 'Daniel is a student',
      sourceLanguage: 'es',
      targetLanguage: 'en',
      isMachineGenerated: true,
      fromCache: false,
    });
  });

  it('fetches and shows a paragraph translation on reveal', async () => {
    renderPassageReader();

    fireEvent.click(screen.getAllByText('Reveal paragraph translation')[0]);

    expect(screen.getByText('Translating paragraph...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Daniel is a student')).toBeInTheDocument();
    });

    expect(translateText).toHaveBeenCalledWith({
      text: expect.stringContaining('Daniel es estudiante'),
      sourceLanguage: 'es',
      targetLanguage: 'en',
    });
  });
});
