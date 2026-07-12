import type { Lesson, LessonProgressRecord, LevelId, QuestionAttempt } from '../../types';
import { LEVEL_ORDER } from '../../constants';
import { getPreviousLevel, getNextLevel } from '../../utilities/levelUtils';
import { isReadyForNextLevel } from '../../utilities/levelReadiness';
import { a11Lessons } from './a11Lessons';
import { a12Lessons } from './a12Lessons';
import { a21Lessons } from './a21Lessons';
import { a22Lessons } from './a22Lessons';
import { b11Lessons } from './b11Lessons';
import { b12Lessons } from './b12Lessons';
import { b21Lessons } from './b21Lessons';
import { b22Lessons } from './b22Lessons';

export const ALL_LESSONS: Lesson[] = [
  ...a11Lessons,
  ...a12Lessons,
  ...a21Lessons,
  ...a22Lessons,
  ...b11Lessons,
  ...b12Lessons,
  ...b21Lessons,
  ...b22Lessons,
];

export function getLessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

export function getLessonsByLevel(level: string): Lesson[] {
  return ALL_LESSONS.filter((l) => l.level === level);
}

export function getFirstLessonAtLevel(level: LevelId): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.level === level);
}

function findIncompleteAtLevel(level: LevelId, completedIds: Set<string>): Lesson | undefined {
  return ALL_LESSONS.filter((l) => l.level === level).find((l) => !completedIds.has(l.id));
}

function findInProgressAtLevel(
  level: LevelId,
  lessonProgress: LessonProgressRecord[],
): Lesson | undefined {
  const inProgress = lessonProgress
    .filter((p) => !p.completedAt && p.progressPercentage > 0)
    .map((p) => getLessonById(p.lessonId))
    .filter((l): l is Lesson => l !== undefined && l.level === level);
  return inProgress.sort(
    (a, b) =>
      (lessonProgress.find((p) => p.lessonId === b.id)?.lastAccessedAt ?? '').localeCompare(
        lessonProgress.find((p) => p.lessonId === a.id)?.lastAccessedAt ?? '',
      ),
  )[0];
}

export function getRecommendedLesson(
  currentLevel: LevelId,
  completedIds: Set<string>,
  lessonProgress: LessonProgressRecord[] = [],
): Lesson | undefined {
  const resumed = findInProgressAtLevel(currentLevel, lessonProgress);
  if (resumed) return resumed;

  const currentIncomplete = findIncompleteAtLevel(currentLevel, completedIds);
  if (currentIncomplete) return currentIncomplete;

  const prevLevel = getPreviousLevel(currentLevel);
  if (prevLevel) {
    const prevIncomplete = findIncompleteAtLevel(prevLevel, completedIds);
    if (prevIncomplete) return prevIncomplete;
  }

  return findIncompleteAtLevel(currentLevel, completedIds) ?? ALL_LESSONS.find((l) => !completedIds.has(l.id));
}

export function getFoundationReviewLesson(
  currentLevel: LevelId,
  completedIds: Set<string>,
): Lesson | undefined {
  const prevLevel = getPreviousLevel(currentLevel);
  if (!prevLevel) return undefined;
  return findIncompleteAtLevel(prevLevel, completedIds) ?? getFirstLessonAtLevel(prevLevel);
}

export function getChallengeLesson(
  currentLevel: LevelId,
  completedIds: Set<string>,
  lessonProgress: LessonProgressRecord[],
  attempts: QuestionAttempt[],
): Lesson | undefined {
  if (!isReadyForNextLevel(currentLevel, lessonProgress, attempts)) return undefined;
  const nextLevel = getNextLevel(currentLevel);
  if (!nextLevel) return undefined;
  return findIncompleteAtLevel(nextLevel, completedIds) ?? getFirstLessonAtLevel(nextLevel);
}

export type LessonCardLabel =
  | 'foundation-review'
  | 'current-level'
  | 'recommended'
  | 'next-challenge'
  | 'completed'
  | 'in-progress';

export function getLessonCardLabel(
  lesson: Lesson,
  currentLevel: LevelId,
  recommendedId: string | undefined,
  foundationId: string | undefined,
  challengeId: string | undefined,
  progress: LessonProgressRecord | undefined,
): LessonCardLabel | undefined {
  if (progress?.completedAt) return 'completed';
  if (progress && progress.progressPercentage > 0) return 'in-progress';
  if (lesson.id === recommendedId) return 'recommended';
  if (lesson.id === foundationId) return 'foundation-review';
  if (lesson.id === challengeId) return 'next-challenge';
  if (lesson.level === currentLevel) return 'current-level';
  return undefined;
}

const LABEL_DISPLAY: Record<LessonCardLabel, string> = {
  'foundation-review': 'Foundation review',
  'current-level': 'Current level',
  recommended: 'Recommended',
  'next-challenge': 'Next challenge',
  completed: 'Completed',
  'in-progress': 'In progress',
};

export function getLessonCardLabelText(label: LessonCardLabel): string {
  return LABEL_DISPLAY[label];
}

export function sortLessonsForDisplay(
  lessons: Lesson[],
  currentLevel: LevelId,
): Lesson[] {
  const prevLevel = getPreviousLevel(currentLevel);
  const nextLevel = getNextLevel(currentLevel);

  const priority = (lesson: Lesson): number => {
    if (lesson.level === currentLevel) return 0;
    if (prevLevel && lesson.level === prevLevel) return 1;
    if (nextLevel && lesson.level === nextLevel) return 2;
    return 3 + LEVEL_ORDER.indexOf(lesson.level);
  };

  return [...lessons].sort((a, b) => {
    const pa = priority(a);
    const pb = priority(b);
    if (pa !== pb) return pa - pb;
    return LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level);
  });
}
