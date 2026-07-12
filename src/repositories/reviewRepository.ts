import type { MistakeRecord, ReviewStatus } from '../types';
import { STORAGE_KEYS } from './storageKeys';
import { readStorageValue, writeStorageValue } from '../utilities/storage';
import { generateId } from '../utilities/helpers';

function isArray(data: unknown): data is unknown[] {
  return Array.isArray(data);
}

export interface ReviewRepository {
  getMistakes(): MistakeRecord[];
  saveMistake(mistake: Omit<MistakeRecord, 'id' | 'attemptCount' | 'reviewStatus'>): MistakeRecord;
  updateMistake(id: string, updates: Partial<MistakeRecord>): MistakeRecord | null;
  getDueMistakes(): MistakeRecord[];
  markMistakeReviewed(id: string, wasCorrect: boolean): void;
  filterMistakes(filters: {
    skill?: string;
    level?: string;
    lessonId?: string;
    reviewStatus?: ReviewStatus;
    grammarTag?: string;
  }): MistakeRecord[];
}

export const reviewRepository: ReviewRepository = {
  getMistakes(): MistakeRecord[] {
    return readStorageValue(STORAGE_KEYS.mistakeNotebook, [], isArray) as MistakeRecord[];
  },

  saveMistake(mistake): MistakeRecord {
    const all = this.getMistakes();
    const existing = all.find((m) => m.questionId === mistake.questionId);
    if (existing) {
      const updated = {
        ...existing,
        userAnswer: mistake.userAnswer,
        attemptedAt: mistake.attemptedAt,
        attemptCount: existing.attemptCount + 1,
        reviewStatus: 'pending' as ReviewStatus,
      };
      const index = all.findIndex((m) => m.id === existing.id);
      all[index] = updated;
      writeStorageValue(STORAGE_KEYS.mistakeNotebook, all);
      return updated;
    }

    const newMistake: MistakeRecord = {
      id: generateId('mistake'),
      attemptCount: 1,
      reviewStatus: 'pending',
      nextReviewAt: new Date().toISOString(),
      ...mistake,
    };
    all.push(newMistake);
    writeStorageValue(STORAGE_KEYS.mistakeNotebook, all);
    return newMistake;
  },

  updateMistake(id, updates): MistakeRecord | null {
    const all = this.getMistakes();
    const index = all.findIndex((m) => m.id === id);
    if (index < 0) return null;
    all[index] = { ...all[index], ...updates };
    writeStorageValue(STORAGE_KEYS.mistakeNotebook, all);
    return all[index];
  },

  getDueMistakes(): MistakeRecord[] {
    const now = new Date().toISOString();
    return this.getMistakes().filter(
      (m) => m.reviewStatus !== 'mastered' && (!m.nextReviewAt || m.nextReviewAt <= now),
    );
  },

  markMistakeReviewed(id, wasCorrect): void {
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + (wasCorrect ? 7 : 1));
    this.updateMistake(id, {
      reviewStatus: wasCorrect ? 'reviewed' : 'pending',
      reviewedCorrectly: wasCorrect,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: nextReview.toISOString(),
    });
  },

  filterMistakes(filters): MistakeRecord[] {
    return this.getMistakes().filter((m) => {
      if (filters.skill && !m.skillTags.includes(filters.skill as MistakeRecord['skillTags'][number])) {
        return false;
      }
      if (filters.level && m.level !== filters.level) return false;
      if (filters.lessonId && m.lessonId !== filters.lessonId) return false;
      if (filters.reviewStatus && m.reviewStatus !== filters.reviewStatus) return false;
      if (filters.grammarTag && !m.grammarTags?.includes(filters.grammarTag)) return false;
      return true;
    });
  },
};
