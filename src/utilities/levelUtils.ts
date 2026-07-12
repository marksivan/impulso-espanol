import type { LevelId } from '../types';
import { LEVEL_ORDER } from '../constants';

export function isLevelId(value: string): value is LevelId {
  return (LEVEL_ORDER as string[]).includes(value);
}

export function getLevelIndex(level: LevelId): number {
  return LEVEL_ORDER.indexOf(level);
}

export function getPreviousLevel(level: LevelId): LevelId | null {
  const index = getLevelIndex(level);
  return index > 0 ? LEVEL_ORDER[index - 1] : null;
}

export function getNextLevel(level: LevelId): LevelId | null {
  const index = getLevelIndex(level);
  return index >= 0 && index < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[index + 1] : null;
}

export function compareLevels(a: LevelId, b: LevelId): number {
  return getLevelIndex(a) - getLevelIndex(b);
}

export function getLevelLabel(level: LevelId): string {
  const labels: Record<LevelId, string> = {
    'A1.1': 'Foundations',
    'A1.2': 'Early Beginner',
    'A2.1': 'Elementary',
    'A2.2': 'Upper Elementary',
    'B1.1': 'Intermediate',
    'B1.2': 'Upper Intermediate',
    'B2.1': 'Advanced',
    'B2.2': 'Upper Advanced',
  };
  return labels[level];
}

export function getLevelSelectLabel(level: LevelId): string {
  return `${level} — ${getLevelLabel(level)}`;
}
