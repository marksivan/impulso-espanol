import type { Question } from '../../types';
import { SKILL_LABELS } from '../../constants';
import { Button } from '../common/Button';

interface AnswerFeedbackProps {
  question: Question;
  userAnswer: string | string[];
  isCorrect: boolean;
  onContinue: () => void;
  onReviewPassage: () => void;
  onSaveMistake: () => void;
}

export function AnswerFeedback({
  question,
  userAnswer,
  isCorrect,
  onContinue,
  onReviewPassage,
  onSaveMistake,
}: AnswerFeedbackProps) {
  const correctDisplay = Array.isArray(question.correctAnswer)
    ? question.correctAnswer.join(' → ')
    : question.choices?.find((c) => c.id === question.correctAnswer)?.text ??
      question.correctAnswer;

  const userDisplay = Array.isArray(userAnswer)
    ? userAnswer.join(' → ')
    : question.choices?.find((c) => c.id === userAnswer)?.text ?? userAnswer;

  let whyWrong = '';
  if (!isCorrect && question.incorrectChoiceExplanations && typeof userAnswer === 'string') {
    whyWrong = question.incorrectChoiceExplanations[userAnswer] ?? '';
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl p-5 border ${
        isCorrect
          ? 'bg-[var(--color-success-bg)] border-[var(--color-success)]'
          : 'bg-[var(--color-error-bg)] border-[var(--color-error)]'
      }`}
    >
      <p className="font-semibold text-lg m-0 mb-3">
        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
      </p>

      <div className="space-y-2 text-sm">
        <p>
          <strong>Correct answer:</strong> {correctDisplay}
        </p>
        {!isCorrect && userDisplay && (
          <p>
            <strong>Your answer:</strong> {userDisplay}
          </p>
        )}
        <p>
          <strong>Why:</strong> {question.explanation}
        </p>
        {!isCorrect && whyWrong && (
          <p>
            <strong>Why your answer was not correct:</strong> {whyWrong}
          </p>
        )}
        {question.evidenceQuote && (
          <p>
            <strong>Passage evidence:</strong> &ldquo;{question.evidenceQuote}&rdquo;
          </p>
        )}
        <p>
          <strong>Skill:</strong>{' '}
          {question.skillTags.map((s) => SKILL_LABELS[s]).join(', ')}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Button onClick={onContinue}>Continue</Button>
        <Button variant="ghost" onClick={onReviewPassage}>
          Review passage
        </Button>
        {!isCorrect && (
          <Button variant="ghost" onClick={onSaveMistake}>
            Save to Mistake Notebook
          </Button>
        )}
      </div>
    </div>
  );
}
