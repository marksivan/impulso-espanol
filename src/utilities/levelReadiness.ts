import type { LevelId, LessonProgressRecord, QuestionAttempt } from '../types';
import { LEVEL_ORDER } from '../constants';
import { ALL_LESSONS } from '../data/lessons';
import { getNextLevel } from './levelUtils';
import { calculatePercentage } from './helpers';

const READINESS_THRESHOLD = 70;

export function calculateLevelReadiness(
  currentLevel: LevelId,
  lessonProgress: LessonProgressRecord[],
  attempts: QuestionAttempt[],
): number | null {
  const levelLessons = ALL_LESSONS.filter((l) => l.level === currentLevel);
  if (levelLessons.length === 0) return null;

  const completed = levelLessons.filter((l) =>
    lessonProgress.some((p) => p.lessonId === l.id && p.completedAt),
  ).length;
  const completionPct = Math.round((completed / levelLessons.length) * 100);

  const levelLessonIds = new Set(levelLessons.map((l) => l.id));
  const levelAttempts = attempts.filter((a) => levelLessonIds.has(a.lessonId));

  if (completed === 0 && levelAttempts.length === 0) return null;

  const accuracyPct =
    levelAttempts.length > 0
      ? calculatePercentage(
          levelAttempts.filter((a) => a.isCorrect).length,
          levelAttempts.length,
        )
      : 0;

  return Math.round(completionPct * 0.6 + accuracyPct * 0.4);
}

export function isReadyForNextLevel(
  currentLevel: LevelId,
  lessonProgress: LessonProgressRecord[],
  attempts: QuestionAttempt[],
): boolean {
  const readiness = calculateLevelReadiness(currentLevel, lessonProgress, attempts);
  return readiness !== null && readiness >= READINESS_THRESHOLD;
}

export function getLevelStats(
  lessonProgress: LessonProgressRecord[],
  _attempts: QuestionAttempt[],
) {
  return LEVEL_ORDER.map((level) => {
    const lessons = ALL_LESSONS.filter((l) => l.level === level);
    const completed = lessonProgress.filter(
      (p) => p.completedAt && lessons.some((l) => l.id === p.lessonId),
    );
    const avgScore =
      completed.length > 0
        ? Math.round(completed.reduce((s, p) => s + p.bestScore, 0) / completed.length)
        : 0;
    const inProgress = lessonProgress.some(
      (p) => !p.completedAt && lessons.some((l) => l.id === p.lessonId),
    );

    let status: 'not-started' | 'in-progress' | 'completed' = 'not-started';
    if (completed.length === lessons.length && lessons.length > 0) status = 'completed';
    else if (completed.length > 0 || inProgress) status = 'in-progress';

    return {
      level,
      total: lessons.length,
      completed: completed.length,
      avgScore,
      status,
    };
  });
}

export function getReadinessLabel(currentLevel: LevelId): string {
  const next = getNextLevel(currentLevel);
  return next ? `Progress toward ${next}` : 'Highest level reached';
}
