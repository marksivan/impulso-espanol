import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { LevelId, Lesson } from '../../types';
import { getLevelInfo } from '../../data/levels';
import { getLevelLabel } from '../../utilities/levelUtils';
import { calculateLevelReadiness, getReadinessLabel } from '../../utilities/levelReadiness';
import { SpeakButton } from '../common/SpeakButton';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface CurrentLevelOverviewProps {
  currentLevel: LevelId;
  recommendedLesson: Lesson | undefined;
  foundationLesson: Lesson | undefined;
  lessonProgress: import('../../types').LessonProgressRecord[];
  attempts: import('../../types').QuestionAttempt[];
}

export function CurrentLevelOverview({
  currentLevel,
  recommendedLesson,
  foundationLesson,
  lessonProgress,
  attempts,
}: CurrentLevelOverviewProps) {
  const levelInfo = getLevelInfo(currentLevel);
  const readiness = calculateLevelReadiness(currentLevel, lessonProgress, attempts);
  const readinessLabel = getReadinessLabel(currentLevel);
  const [revealedExamples, setRevealedExamples] = useState<Set<number>>(new Set());

  function toggleExample(index: number) {
    setRevealedExamples((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  if (!levelInfo) return null;

  return (
    <Card>
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl shrink-0" aria-hidden="true">
          🇪🇸
        </span>
        <div className="min-w-0">
          <p className="text-xs text-[var(--color-text-muted)] m-0 mb-1">
            Your current learning level
          </p>
          <h2 className="text-2xl font-bold text-[var(--color-primary)] m-0">{currentLevel}</h2>
          <p className="text-lg font-medium m-0">{getLevelLabel(currentLevel)}</p>
        </div>
      </div>

      <section className="mb-5">
        <h3 className="text-sm font-semibold m-0 mb-2">What this means</h3>
        <p className="text-sm text-[var(--color-text-muted)] m-0 leading-relaxed">
          {levelInfo.whatThisMeans ?? levelInfo.description}
        </p>
      </section>

      <section className="mb-5">
        <h3 className="text-sm font-semibold m-0 mb-2">Practical abilities</h3>
        <ul className="space-y-2 m-0 p-0 list-none">
          {levelInfo.expectedAbilities.slice(0, 4).map((ability) => (
            <li key={ability} className="flex items-start gap-2 text-sm">
              <span className="text-[var(--color-success)] shrink-0" aria-hidden="true">
                ✓
              </span>
              <span>{ability}</span>
            </li>
          ))}
        </ul>
      </section>

      {levelInfo.examples && levelInfo.examples.length > 0 && (
        <section className="mb-5">
          <h3 className="text-sm font-semibold m-0 mb-3">Example Spanish</h3>
          <div className="space-y-3">
            {levelInfo.examples.map((ex, i) => (
              <div
                key={i}
                className="p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)]"
              >
                <div className="flex items-start gap-2">
                  <p className="font-reading text-base m-0 flex-1 min-w-0 break-words">
                    {ex.spanish}
                  </p>
                  <SpeakButton text={ex.spanish} label={`Listen: ${ex.spanish}`} />
                </div>
                <div className="mt-2">
                  {revealedExamples.has(i) ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-[var(--color-text-muted)] m-0 italic">
                        {ex.english}
                      </p>
                      <button
                        type="button"
                        className="text-xs text-[var(--color-accent)] underline bg-transparent border-0 cursor-pointer p-0"
                        onClick={() => toggleExample(i)}
                        aria-expanded="true"
                      >
                        Hide meaning
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="text-xs text-[var(--color-accent)] underline bg-transparent border-0 cursor-pointer p-0"
                      onClick={() => toggleExample(i)}
                      aria-expanded="false"
                    >
                      Show meaning
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold m-0">{readinessLabel}</h3>
          {readiness !== null && (
            <span className="text-sm font-medium">{readiness}%</span>
          )}
        </div>
        {readiness !== null ? (
          <>
            <p className="text-xs text-[var(--color-text-muted)] mb-2 m-0">Level readiness</p>
            <div
              className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={readiness}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${readinessLabel}: ${readiness}%`}
            >
              <div
                className="h-full bg-[var(--color-accent)] rounded-full transition-all"
                style={{ width: `${readiness}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)] m-0">
            Complete more {currentLevel} lessons to estimate your readiness for the next level.
          </p>
        )}
      </section>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        {recommendedLesson && (
          <Link to={`/lesson/${recommendedLesson.id}`} className="flex-1 min-w-0">
            <Button className="w-full">Continue {currentLevel}</Button>
          </Link>
        )}
        {foundationLesson && (
          <Link
            to={`/learn?level=${foundationLesson.level}`}
            className="flex-1 min-w-0"
          >
            <Button variant="ghost" className="w-full">
              Review {foundationLesson.level} foundations
            </Button>
          </Link>
        )}
      </div>
      <Link
        to="/placement"
        className="inline-block mt-3 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
      >
        Retake placement assessment
      </Link>
    </Card>
  );
}
