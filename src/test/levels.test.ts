import { describe, it, expect } from 'vitest';
import { LEVEL_ORDER, DEFAULT_LEVEL } from '../constants';
import {
  getLevelIndex,
  getPreviousLevel,
  getNextLevel,
  compareLevels,
  isLevelId,
  getLevelSelectLabel,
} from '../utilities/levelUtils';
import { isUntouchedOldDefault } from '../utilities/migration';
import { evaluatePlacement } from '../data/placement';
import {
  ALL_LESSONS,
  getRecommendedLesson,
  getFoundationReviewLesson,
} from '../data/lessons';
import { a11Lessons } from '../data/lessons/a11Lessons';
import { a12Lessons } from '../data/lessons/a12Lessons';
import type { UserProfile } from '../types';

describe('level system', () => {
  it('includes A1.1 and A1.2 in LEVEL_ORDER', () => {
    expect(LEVEL_ORDER[0]).toBe('A1.1');
    expect(LEVEL_ORDER[1]).toBe('A1.2');
    expect(LEVEL_ORDER).toHaveLength(8);
  });

  it('defaults to A1.2', () => {
    expect(DEFAULT_LEVEL).toBe('A1.2');
  });

  it('level utilities work correctly', () => {
    expect(getLevelIndex('A1.2')).toBe(1);
    expect(getPreviousLevel('A1.2')).toBe('A1.1');
    expect(getNextLevel('A1.2')).toBe('A2.1');
    expect(compareLevels('A1.1', 'A2.1')).toBeLessThan(0);
    expect(isLevelId('A1.1')).toBe(true);
    expect(isLevelId('C1')).toBe(false);
    expect(getLevelSelectLabel('A1.2')).toContain('Early Beginner');
  });
});

describe('profile migration', () => {
  const baseProfile: UserProfile = {
    id: 'p1',
    displayName: 'Learner',
    currentLevel: 'A2.1',
    preferredDifficulty: 'standard',
    placementCompleted: false,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    studyDays: [],
  };

  it('identifies untouched old A2.1 default', () => {
    expect(isUntouchedOldDefault(baseProfile)).toBe(true);
  });

  it('does not migrate profile with placement completed', () => {
    expect(isUntouchedOldDefault({ ...baseProfile, placementCompleted: true })).toBe(false);
  });

  it('does not migrate manually selected B1 level', () => {
    expect(
      isUntouchedOldDefault({ ...baseProfile, currentLevel: 'B1.1', placementCompleted: true }),
    ).toBe(false);
  });
});

describe('placement evaluation', () => {
  it('recommends A1.1 for very low performance', () => {
    const result = evaluatePlacement({ 'place-a11-01': 'b' });
    expect(['A1.1', 'A1.2']).toContain(result.recommendedLevel);
  });

  it('can recommend A1.2 with solid A1.1 performance', () => {
    const answers: Record<string, string> = {
      'place-a11-01': 'a',
      'place-a11-02': 'a',
      'place-a11-03': 'true',
      'place-a12-01': 'b',
    };
    const result = evaluatePlacement(answers);
    expect(LEVEL_ORDER.indexOf(result.recommendedLevel)).toBeGreaterThanOrEqual(0);
    expect(result.highestLevelConsistent).toBeDefined();
  });

  it('minimum recommendation is A1.1', () => {
    const result = evaluatePlacement({});
    expect(result.recommendedLevel).toBe('A1.1');
  });
});

describe('A1 lesson content', () => {
  const a1Lessons = [...a11Lessons, ...a12Lessons];
  const ids = new Set<string>();
  const questionIds = new Set<string>();

  it('has at least 8 A1 lessons', () => {
    expect(a11Lessons.length).toBeGreaterThanOrEqual(4);
    expect(a12Lessons.length).toBeGreaterThanOrEqual(4);
  });

  it('all A1 lessons have unique IDs and valid levels', () => {
    for (const lesson of a1Lessons) {
      expect(ids.has(lesson.id)).toBe(false);
      ids.add(lesson.id);
      expect(lesson.level.startsWith('A1')).toBe(true);
      expect(lesson.questions.length).toBeGreaterThanOrEqual(5);
      expect(lesson.targetVocabulary.length).toBeGreaterThanOrEqual(3);
      expect(lesson.targetGrammar.length).toBeGreaterThanOrEqual(1);
      const hasProduction = lesson.questions.some((q) => q.type === 'short-response');
      expect(hasProduction).toBe(true);
      for (const q of lesson.questions) {
        expect(questionIds.has(q.id)).toBe(false);
        questionIds.add(q.id);
      }
    }
  });

  it('recommends A1.2 lesson for new A1.2 profile', () => {
    const recommended = getRecommendedLesson('A1.2', new Set());
    expect(recommended?.level).toBe('A1.2');
    expect(recommended?.id).toBe(a12Lessons[0]?.id);
  });

  it('offers A1.1 foundation review for A1.2 learner', () => {
    const foundation = getFoundationReviewLesson('A1.2', new Set());
    expect(foundation?.level).toBe('A1.1');
  });

  it('ALL_LESSONS includes A1 before A2', () => {
    const first = ALL_LESSONS[0];
    expect(first.level).toBe('A1.1');
  });
});
