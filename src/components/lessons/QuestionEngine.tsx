import { useState } from 'react';
import type { Question, SelfAssessmentRating } from '../../types';
import { scoreQuestion } from '../../utilities/lessonCompletion';
import { AnswerFeedback } from './AnswerFeedback';
import { Button } from '../common/Button';

interface QuestionEngineProps {
  question: Question;
  onAnswer: (answer: string | string[], isCorrect: boolean, usedHint: boolean) => void;
  onSaveMistake: (answer: string | string[]) => void;
  onReviewPassage: () => void;
  challengeMode?: boolean;
  showExplanationsImmediately?: boolean;
  autoAdvance?: boolean;
  lessonLevel?: string;
}

export function QuestionEngine({
  question,
  onAnswer,
  onSaveMistake,
  onReviewPassage,
  challengeMode = false,
  showExplanationsImmediately = true,
  autoAdvance = false,
  lessonLevel,
}: QuestionEngineProps) {
  const [selected, setSelected] = useState<string | string[]>('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [selfRating, setSelfRating] = useState<SelfAssessmentRating | null>(null);
  const [sequenceOrder, setSequenceOrder] = useState<string[]>([]);

  function handleSubmit() {
    let answer: string | string[] = selected || textAnswer;
    if (question.type === 'sequence') {
      answer = sequenceOrder;
    }

    const correct = scoreQuestion(question, answer, lessonLevel);
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(answer, correct, usedHint);

    if (autoAdvance && correct) {
      setTimeout(() => handleContinue(), 1500);
    }
  }

  function handleContinue() {
    setSubmitted(false);
    setSelected('');
    setTextAnswer('');
    setSequenceOrder([]);
    setUsedHint(false);
    setSelfRating(null);
  }

  if (question.type === 'short-response' || question.type === 'summary') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium m-0">{question.prompt}</h3>
        <textarea
          className="w-full p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] min-h-[120px]"
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder="Write your response in Spanish..."
          aria-label="Your written response"
        />
        {!challengeMode && question.productionChecklist && (
          <div className="text-sm">
            <p className="font-medium">Checklist:</p>
            <ul className="list-disc pl-5">
              {question.productionChecklist.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {submitted ? (
          <div className="space-y-4">
            {question.suggestedAnswer && (
              <div className="p-4 border border-[var(--color-border)] rounded-xl text-sm">
                <p className="font-medium mb-1">Suggested answer:</p>
                <p className="m-0 italic">{question.suggestedAnswer}</p>
              </div>
            )}
            <fieldset>
              <legend className="font-medium text-sm mb-2">Self-assessment</legend>
              <div className="flex flex-wrap gap-2">
                {(['needs-work', 'acceptable', 'strong'] as const).map((rating) => (
                  <Button
                    key={rating}
                    variant={selfRating === rating ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelfRating(rating)}
                  >
                    {rating === 'needs-work' ? 'Needs work' : rating === 'acceptable' ? 'Acceptable' : 'Strong'}
                  </Button>
                ))}
              </div>
            </fieldset>
            <Button onClick={() => onAnswer(textAnswer, true, false)} disabled={!selfRating}>
              Complete production
            </Button>
          </div>
        ) : (
          <Button onClick={handleSubmit} disabled={textAnswer.trim().length < (lessonLevel?.startsWith('A1') ? 5 : 10)}>
            Submit response
          </Button>
        )}
      </div>
    );
  }

  if (submitted && showExplanationsImmediately) {
    return (
      <AnswerFeedback
        question={question}
        userAnswer={selected || textAnswer || sequenceOrder}
        isCorrect={isCorrect}
        onContinue={handleContinue}
        onReviewPassage={onReviewPassage}
        onSaveMistake={() => onSaveMistake(selected || textAnswer)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium m-0">{question.prompt}</h3>

      {question.type === 'fill-gap' && (
        <input
          type="text"
          className="w-full max-w-md p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)]"
          value={typeof selected === 'string' ? selected : ''}
          onChange={(e) => setSelected(e.target.value)}
          placeholder="Type your answer..."
          aria-label="Fill in the gap"
        />
      )}

      {question.type === 'sequence' && question.choices && (
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-text-muted)]">Click to add in order:</p>
          <div className="flex flex-wrap gap-2">
            {question.choices.map((c) => (
              <Button
                key={c.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!sequenceOrder.includes(c.id)) {
                    setSequenceOrder([...sequenceOrder, c.id]);
                  }
                }}
                disabled={sequenceOrder.includes(c.id)}
              >
                {c.text}
              </Button>
            ))}
          </div>
          {sequenceOrder.length > 0 && (
            <div className="text-sm">
              Order:{' '}
              {sequenceOrder
                .map((id) => question.choices?.find((c) => c.id === id)?.text)
                .join(' → ')}
              <Button variant="ghost" size="sm" onClick={() => setSequenceOrder([])}>
                Reset
              </Button>
            </div>
          )}
        </div>
      )}

      {question.choices &&
        question.type !== 'sequence' &&
        question.type !== 'fill-gap' && (
          <fieldset>
            <legend className="sr-only">Answer choices</legend>
            <div className="space-y-2">
              {question.choices.map((choice) => (
                <label
                  key={choice.id}
                  className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                    selected === choice.id
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-border)]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={choice.id}
                    checked={selected === choice.id}
                    onChange={() => setSelected(choice.id)}
                    className="mt-1"
                  />
                  <span>{choice.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

      {!challengeMode && (
        <Button variant="ghost" size="sm" onClick={() => setUsedHint(true)}>
          Show hint
        </Button>
      )}
      {usedHint && (
        <p className="text-sm text-[var(--color-text-muted)]">
          Hint: Re-read the relevant part of the passage carefully.
        </p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={
          question.type === 'sequence'
            ? sequenceOrder.length === 0
            : question.type === 'fill-gap'
              ? !selected
              : !selected
        }
      >
        Check answer
      </Button>
    </div>
  );
}
