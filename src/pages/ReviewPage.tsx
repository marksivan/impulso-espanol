import { useState } from 'react';
import { useProgressData } from '../hooks/useProgressData';
import { reviewRepository } from '../repositories/reviewRepository';
import { vocabularyRepository } from '../repositories/vocabularyRepository';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { SKILL_LABELS } from '../constants';
import { useApp } from '../context/AppContext';

export function ReviewPage() {
  const { mistakes, dueVocab } = useProgressData();
  const { refreshData } = useApp();
  const [tab, setTab] = useState<'mistakes' | 'vocabulary'>('mistakes');
  const [skillFilter, setSkillFilter] = useState('');
  const [reviewingMistake, setReviewingMistake] = useState<string | null>(null);
  const [reviewAnswer, setReviewAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);

  const [vocabReview, setVocabReview] = useState<(typeof dueVocab)[0] | null>(null);
  const [vocabRevealed, setVocabRevealed] = useState(false);
  const [vocabInput, setVocabInput] = useState('');

  const filteredMistakes = skillFilter
    ? reviewRepository.filterMistakes({ skill: skillFilter })
    : mistakes;

  function handleMistakeReview(id: string) {
    const mistake = mistakes.find((m) => m.id === id);
    if (!mistake) return;
    setReviewingMistake(id);
    setReviewAnswer('');
    setShowResult(false);
  }

  function checkMistakeReview() {
    if (!reviewingMistake) return;
    const mistake = mistakes.find((m) => m.id === reviewingMistake);
    if (!mistake) return;
    const correct =
      reviewAnswer.toLowerCase().trim() ===
      (typeof mistake.correctAnswer === 'string'
        ? mistake.correctAnswer.toLowerCase().trim()
        : '');
    reviewRepository.markMistakeReviewed(reviewingMistake, correct);
    setShowResult(true);
    refreshData();
  }

  function startVocabReview() {
    if (dueVocab.length === 0) return;
    setVocabReview(dueVocab[0]);
    setVocabRevealed(false);
    setVocabInput('');
  }

  function rateVocab(rating: 'again' | 'hard' | 'good' | 'easy') {
    if (!vocabReview) return;
    const wasCorrect = vocabRevealed && vocabInput.toLowerCase().includes(vocabReview.term.toLowerCase());
    vocabularyRepository.recordReview(vocabReview.id, rating, wasCorrect, 'recall');
    setVocabReview(null);
    refreshData();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold m-0">Review</h1>
        <p className="text-[var(--color-text-muted)] m-0 mt-1">
          Mistake notebook and vocabulary review queue.
        </p>
      </header>

      <div className="flex gap-2">
        <Button
          variant={tab === 'mistakes' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setTab('mistakes')}
        >
          Mistake Notebook ({mistakes.length})
        </Button>
        <Button
          variant={tab === 'vocabulary' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setTab('vocabulary')}
        >
          Vocabulary Review ({dueVocab.length} due)
        </Button>
      </div>

      {tab === 'mistakes' && (
        <>
          <select
            className="p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)]"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            aria-label="Filter by skill"
          >
            <option value="">All skills</option>
            {Object.entries(SKILL_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          {reviewingMistake ? (
            <Card title="Review mistake">
              {(() => {
                const m = mistakes.find((x) => x.id === reviewingMistake);
                if (!m) return null;
                return (
                  <div className="space-y-3">
                    <p className="font-medium">{m.prompt}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Lesson: {m.lessonTitle}
                    </p>
                    {!showResult ? (
                      <>
                        <input
                          className="w-full p-2 border border-[var(--color-border)] rounded-lg"
                          value={reviewAnswer}
                          onChange={(e) => setReviewAnswer(e.target.value)}
                          placeholder="Your answer..."
                        />
                        <div className="flex gap-2">
                          <Button onClick={checkMistakeReview}>Check</Button>
                          <Button variant="ghost" onClick={() => setReviewingMistake(null)}>
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p>{m.explanation}</p>
                        <Button onClick={() => setReviewingMistake(null)}>Done</Button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </Card>
          ) : filteredMistakes.length === 0 ? (
            <EmptyState
              title="No mistakes saved"
              description="When you answer incorrectly, save questions to your Mistake Notebook for later review."
            />
          ) : (
            <div className="space-y-3">
              {filteredMistakes.map((m) => (
                <Card key={m.id}>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="level">{m.level}</Badge>
                    {m.skillTags.map((s) => (
                      <Badge key={s}>{SKILL_LABELS[s]}</Badge>
                    ))}
                    <Badge variant={m.reviewStatus === 'mastered' ? 'success' : 'default'}>
                      {m.reviewStatus}
                    </Badge>
                  </div>
                  <p className="font-medium m-0 mb-1">{m.prompt}</p>
                  <p className="text-sm text-[var(--color-text-muted)] m-0 mb-3">
                    {m.lessonTitle} · {m.attemptCount} attempt{m.attemptCount > 1 ? 's' : ''}
                  </p>
                  <Button size="sm" onClick={() => handleMistakeReview(m.id)}>
                    Review
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'vocabulary' && (
        <>
          {vocabReview ? (
            <Card title="Vocabulary review">
              <p className="text-sm text-[var(--color-text-muted)] mb-2">
                {vocabReview.sourceSentence ?? 'Recall this word:'}
              </p>
              <p className="text-xl font-semibold mb-4">
                {vocabRevealed ? vocabReview.translation : '???'}
              </p>
              {!vocabRevealed ? (
                <>
                  <input
                    className="w-full p-2 border border-[var(--color-border)] rounded-lg mb-3"
                    value={vocabInput}
                    onChange={(e) => setVocabInput(e.target.value)}
                    placeholder="Type the Spanish word or phrase..."
                  />
                  <Button onClick={() => setVocabRevealed(true)}>Reveal answer</Button>
                </>
              ) : (
                <div className="space-y-2">
                  <p>
                    <strong>{vocabReview.term}</strong> — {vocabReview.translation}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="ghost" onClick={() => rateVocab('again')}>
                      Again
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => rateVocab('hard')}>
                      Hard
                    </Button>
                    <Button size="sm" onClick={() => rateVocab('good')}>
                      Good
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => rateVocab('easy')}>
                      Easy
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : dueVocab.length === 0 ? (
            <EmptyState
              title="No reviews due"
              description="Save vocabulary from lessons or the translator to build your review queue."
              icon="✓"
            />
          ) : (
            <Card title="Vocabulary due for review">
              <p className="mb-4">{dueVocab.length} items ready for review.</p>
              <Button onClick={startVocabReview}>Start review session</Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
