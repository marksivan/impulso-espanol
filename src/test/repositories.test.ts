import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readStorageValue, writeStorageValue, removeStorageValue } from '../utilities/storage';
import { progressRepository } from '../repositories/progressRepository';
import { vocabularyRepository } from '../repositories/vocabularyRepository';
import { exportAllProgress, importProgress } from '../repositories/dataRepository';
import { calculateSkillMastery } from '../utilities/skillMastery';
import { getNextReviewDate, updateConfidence } from '../utilities/vocabularyReview';
import { scoreQuestion, isLessonComplete } from '../utilities/lessonCompletion';
import { validateImportData } from '../utilities/exportImport';
import type { Question, Lesson, QuestionAttempt } from '../types';

const storage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(storage).forEach((k) => delete storage[k]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
  });
});

describe('storage utilities', () => {
  it('returns fallback for missing keys', () => {
    expect(readStorageValue('missing', [])).toEqual([]);
  });

  it('returns fallback for malformed JSON', () => {
    storage['bad'] = 'not-json{{{';
    expect(readStorageValue('bad', { default: true })).toEqual({ default: true });
  });

  it('reads and writes enveloped data', () => {
    writeStorageValue('test', { foo: 'bar' });
    const result = readStorageValue('test', { foo: '' });
    expect(result).toEqual({ foo: 'bar' });
  });

  it('removes storage values', () => {
    writeStorageValue('test', 'value');
    removeStorageValue('test');
    expect(readStorageValue('test', null)).toBeNull();
  });
});

describe('progressRepository', () => {
  it('saves and retrieves question attempts', () => {
    progressRepository.saveQuestionAttempt({
      id: 'a1',
      lessonId: 'lesson-1',
      questionId: 'q1',
      userAnswer: 'b',
      isCorrect: true,
      usedHint: false,
      usedTranslation: false,
      skillTags: ['main-idea'],
      attemptedAt: new Date().toISOString(),
    });

    const attempts = progressRepository.getQuestionAttempts();
    expect(attempts).toHaveLength(1);
    expect(attempts[0].isCorrect).toBe(true);
  });

  it('updates skill mastery after attempts', () => {
    progressRepository.saveQuestionAttempt({
      id: 'a2',
      lessonId: 'lesson-1',
      questionId: 'q2',
      userAnswer: 'a',
      isCorrect: false,
      usedHint: true,
      usedTranslation: false,
      skillTags: ['inference'],
      attemptedAt: new Date().toISOString(),
    });

    const mastery = progressRepository.getSkillMastery();
    const inference = mastery.find((m) => m.skill === 'inference');
    expect(inference?.totalAttempts).toBe(1);
  });
});

describe('export and import', () => {
  it('generates valid export data', () => {
    const data = exportAllProgress();
    expect(data.exportVersion).toBe(1);
    expect(data.exportedAt).toBeTruthy();
    expect(Array.isArray(data.lessonProgress)).toBe(true);
    expect(data.settings).toBeTruthy();
  });

  it('validates import data', () => {
    expect(validateImportData(null)).toBe(false);
    expect(validateImportData({ exportVersion: 99 })).toBe(false);
    const valid = exportAllProgress();
    expect(validateImportData(valid)).toBe(true);
  });

  it('imports valid data', () => {
    const data = exportAllProgress();
    data.savedVocabulary = [
      {
        id: 'v1',
        sourceLanguage: 'es',
        term: 'aprovechar',
        translation: 'to take advantage of',
        confidence: 0,
        createdAt: new Date().toISOString(),
        reviewCount: 0,
      },
    ];
    const result = importProgress(data);
    expect(result.success).toBe(true);
    expect(vocabularyRepository.getAll()).toHaveLength(1);
  });

  it('rejects invalid import', () => {
    const result = importProgress({ invalid: true });
    expect(result.success).toBe(false);
  });
});

describe('skill mastery calculations', () => {
  it('calculates mastery from attempts', () => {
    const attempts: QuestionAttempt[] = [
      {
        id: '1',
        lessonId: 'l1',
        questionId: 'q1',
        userAnswer: 'a',
        isCorrect: true,
        usedHint: false,
        usedTranslation: false,
        skillTags: ['inference'],
        attemptedAt: new Date().toISOString(),
      },
      {
        id: '2',
        lessonId: 'l1',
        questionId: 'q2',
        userAnswer: 'b',
        isCorrect: false,
        usedHint: false,
        usedTranslation: false,
        skillTags: ['inference'],
        attemptedAt: new Date().toISOString(),
      },
    ];

    const mastery = calculateSkillMastery(attempts);
    const inference = mastery.find((m) => m.skill === 'inference');
    expect(inference?.totalAttempts).toBe(2);
    expect(inference?.correctAttempts).toBe(1);
    expect(inference?.masteryLabel).toBeDefined();
  });
});

describe('vocabulary review scheduling', () => {
  it('schedules again for same day', () => {
    const date = getNextReviewDate('again', 0);
    const diff = new Date(date).getTime() - Date.now();
    expect(diff).toBeLessThan(5 * 60 * 60 * 1000);
  });

  it('extends intervals for good ratings', () => {
    const date = getNextReviewDate('good', 3);
    const days = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    expect(days).toBeGreaterThanOrEqual(2);
  });

  it('updates confidence levels', () => {
    expect(updateConfidence(2, 'again')).toBe(1);
    expect(updateConfidence(2, 'good')).toBe(3);
    expect(updateConfidence(3, 'easy')).toBe(4);
  });
});

describe('lesson completion', () => {
  const mockQuestion: Question = {
    id: 'q1',
    lessonId: 'l1',
    type: 'multiple-choice',
    stage: 'comprehension',
    prompt: 'Test?',
    correctAnswer: 'b',
    explanation: 'Because B',
    skillTags: ['explicit-information'],
    difficulty: 1,
    choices: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
    ],
  };

  it('scores multiple choice correctly', () => {
    expect(scoreQuestion(mockQuestion, 'b')).toBe(true);
    expect(scoreQuestion(mockQuestion, 'a')).toBe(false);
  });

  it('checks lesson completion requirements', () => {
    const lesson: Lesson = {
      id: 'l1',
      title: 'Test',
      level: 'A2.1',
      topic: 'Test',
      estimatedMinutes: 10,
      passage: {
        id: 'p1',
        title: 'P',
        text: 'Hola',
        paragraphs: ['Hola'],
        wordCount: 1,
        sourceType: 'original',
      },
      questions: [mockQuestion],
      targetVocabulary: [],
      targetGrammar: [],
      completionRequirements: { minCorrectPercentage: 60, requireProduction: false },
      skillsTested: ['explicit-information'],
    };

    const progress = {
      id: 'prog1',
      lessonId: 'l1',
      level: 'A2.1' as const,
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      currentStage: 'complete',
      progressPercentage: 100,
      bestScore: 100,
      attemptCount: 1,
      questionsAnswered: 1,
      questionsCorrect: 1,
      wordsLookedUp: 0,
      paragraphTranslationsRevealed: 0,
      hintsUsed: 0,
      productionCompleted: false,
    };

    const attempts: QuestionAttempt[] = [
      {
        id: 'a1',
        lessonId: 'l1',
        questionId: 'q1',
        userAnswer: 'b',
        isCorrect: true,
        usedHint: false,
        usedTranslation: false,
        skillTags: ['explicit-information'],
        attemptedAt: new Date().toISOString(),
      },
    ];

    expect(isLessonComplete(lesson, progress, attempts)).toBe(true);
  });
});

describe('translation service', () => {
  it('rejects empty input', async () => {
    const { translateText, TranslationError } = await import('../services/translationService');
    await expect(
      translateText({ text: '', sourceLanguage: 'es', targetLanguage: 'en' }),
    ).rejects.toThrow(TranslationError);
  });

  it('rejects text over character limit', async () => {
    const { translateText, TranslationError } = await import('../services/translationService');
    await expect(
      translateText({
        text: 'a'.repeat(500),
        sourceLanguage: 'es',
        targetLanguage: 'en',
      }),
    ).rejects.toThrow(TranslationError);
  });
});
