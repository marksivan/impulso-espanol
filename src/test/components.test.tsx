import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnswerFeedback } from '../components/lessons/AnswerFeedback';
import { QuestionEngine } from '../components/lessons/QuestionEngine';
import type { Question } from '../types';

const mockQuestion: Question = {
  id: 'q1',
  lessonId: 'l1',
  type: 'multiple-choice',
  stage: 'comprehension',
  prompt: '¿Por qué salió tarde Andrés?',
  choices: [
    { id: 'a', text: 'Por el tráfico' },
    { id: 'b', text: 'Salió veinte minutos después de lo habitual' },
    { id: 'c', text: 'Porque perdió el autobús' },
  ],
  correctAnswer: 'b',
  explanation: 'The passage says he left twenty minutes later than usual.',
  incorrectChoiceExplanations: {
    a: 'Traffic delayed the bus, but that was not the original reason.',
  },
  evidenceQuote: 'salió veinte minutos más tarde de lo habitual',
  skillTags: ['cause-and-effect'],
  difficulty: 2,
};

describe('AnswerFeedback', () => {
  it('shows correct feedback', () => {
    render(
      <AnswerFeedback
        question={mockQuestion}
        userAnswer="b"
        isCorrect={true}
        onContinue={() => {}}
        onReviewPassage={() => {}}
        onSaveMistake={() => {}}
      />,
    );
    expect(screen.getByText('✓ Correct')).toBeInTheDocument();
    expect(screen.getByText(/Cause and effect/)).toBeInTheDocument();
  });

  it('shows incorrect feedback with explanation', () => {
    render(
      <AnswerFeedback
        question={mockQuestion}
        userAnswer="a"
        isCorrect={false}
        onContinue={() => {}}
        onReviewPassage={() => {}}
        onSaveMistake={() => {}}
      />,
    );
    expect(screen.getByText(/Incorrect/)).toBeInTheDocument();
    expect(screen.getByText(/Traffic delayed the bus/)).toBeInTheDocument();
    expect(screen.getByText(/Save to Mistake Notebook/)).toBeInTheDocument();
  });
});

describe('QuestionEngine', () => {
  it('submits and shows feedback for correct answer', () => {
    const onAnswer = vi.fn();
    render(
      <QuestionEngine
        question={mockQuestion}
        onAnswer={onAnswer}
        onSaveMistake={() => {}}
        onReviewPassage={() => {}}
      />,
    );

    fireEvent.click(screen.getByLabelText(/Salió veinte minutos/));
    fireEvent.click(screen.getByText('Check answer'));

    expect(screen.getByText('✓ Correct')).toBeInTheDocument();
    expect(onAnswer).toHaveBeenCalledWith('b', true, false);
  });

  it('submits incorrect answer and shows feedback', () => {
    render(
      <QuestionEngine
        question={mockQuestion}
        onAnswer={() => {}}
        onSaveMistake={() => {}}
        onReviewPassage={() => {}}
      />,
    );

    fireEvent.click(screen.getByLabelText(/Por el tráfico/));
    fireEvent.click(screen.getByText('Check answer'));

    expect(screen.getByText(/Incorrect/)).toBeInTheDocument();
  });
});

describe('Translator error state', () => {
  it('disables translate when input is empty', async () => {
    const { TranslatorPage } = await import('../pages/TranslatorPage');
    const { AppProvider } = await import('../context/AppContext');

    render(
      <AppProvider>
        <TranslatorPage />
      </AppProvider>,
    );

    const buttons = screen.getAllByRole('button', { name: 'Translate' });
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });
});

describe('Reset confirmation', () => {
  it('shows reset modal on click', async () => {
    const { SettingsPage } = await import('../pages/SettingsPage');
    const { AppProvider } = await import('../context/AppContext');

    render(
      <AppProvider>
        <SettingsPage />
      </AppProvider>,
    );

    fireEvent.click(screen.getByText('Reset all progress'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Yes, delete everything')).toBeInTheDocument();
  });
});
