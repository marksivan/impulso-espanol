import type { Lesson } from '../../types';
import { a21Lessons } from './a21Lessons';
import { a22Lessons } from './a22Lessons';
import { b11Lessons } from './b11Lessons';
import { b12Lessons } from './b12Lessons';
import { b21Lessons } from './b21Lessons';
import { b22Lessons } from './b22Lessons';

export const ALL_LESSONS: Lesson[] = [
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

export function getRecommendedLesson(
  currentLevel: string,
  completedIds: Set<string>,
): Lesson | undefined {
  const levelLessons = ALL_LESSONS.filter((l) => l.level === currentLevel);
  const incomplete = levelLessons.filter((l) => !completedIds.has(l.id));
  if (incomplete.length > 0) return incomplete[0];
  const anyIncomplete = ALL_LESSONS.filter((l) => !completedIds.has(l.id));
  return anyIncomplete[0];
}
