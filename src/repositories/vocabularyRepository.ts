import type { SavedVocabularyItem, VocabularyReviewRecord } from '../types';
import { STORAGE_KEYS } from './storageKeys';
import { readStorageValue, writeStorageValue } from '../utilities/storage';
import { getDueVocabulary, getNextReviewDate, updateConfidence } from '../utilities/vocabularyReview';
import { generateId } from '../utilities/helpers';

function isArray(data: unknown): data is unknown[] {
  return Array.isArray(data);
}

export interface VocabularyRepository {
  getAll(): SavedVocabularyItem[];
  getById(id: string): SavedVocabularyItem | null;
  saveWord(item: Omit<SavedVocabularyItem, 'id' | 'createdAt' | 'reviewCount' | 'confidence'> & Partial<Pick<SavedVocabularyItem, 'confidence'>>): SavedVocabularyItem;
  updateWord(id: string, updates: Partial<SavedVocabularyItem>): SavedVocabularyItem | null;
  deleteWord(id: string): void;
  getDueReviews(): SavedVocabularyItem[];
  recordReview(vocabularyId: string, rating: 'again' | 'hard' | 'good' | 'easy', wasCorrect: boolean, reviewType: string): void;
  getReviewHistory(): VocabularyReviewRecord[];
}

export const vocabularyRepository: VocabularyRepository = {
  getAll(): SavedVocabularyItem[] {
    return readStorageValue(STORAGE_KEYS.savedVocabulary, [], isArray) as SavedVocabularyItem[];
  },

  getById(id: string): SavedVocabularyItem | null {
    return this.getAll().find((v) => v.id === id) ?? null;
  },

  saveWord(item): SavedVocabularyItem {
    const all = this.getAll();
    const existing = all.find(
      (v) => v.term.toLowerCase() === item.term.toLowerCase() && v.sourceLanguage === item.sourceLanguage,
    );
    if (existing) return existing;

    const newItem: SavedVocabularyItem = {
      id: generateId('vocab'),
      createdAt: new Date().toISOString(),
      reviewCount: 0,
      confidence: item.confidence ?? 0,
      ...item,
    };
    all.push(newItem);
    writeStorageValue(STORAGE_KEYS.savedVocabulary, all);
    return newItem;
  },

  updateWord(id, updates): SavedVocabularyItem | null {
    const all = this.getAll();
    const index = all.findIndex((v) => v.id === id);
    if (index < 0) return null;
    all[index] = { ...all[index], ...updates };
    writeStorageValue(STORAGE_KEYS.savedVocabulary, all);
    return all[index];
  },

  deleteWord(id): void {
    const all = this.getAll().filter((v) => v.id !== id);
    writeStorageValue(STORAGE_KEYS.savedVocabulary, all);
  },

  getDueReviews(): SavedVocabularyItem[] {
    return getDueVocabulary(this.getAll());
  },

  recordReview(vocabularyId, rating, wasCorrect, reviewType): void {
    const item = this.getById(vocabularyId);
    if (!item) return;

    const reviewCount = item.reviewCount + 1;
    const confidence = updateConfidence(item.confidence, rating);
    const nextReviewAt = getNextReviewDate(rating, reviewCount);

    this.updateWord(vocabularyId, {
      reviewCount,
      confidence,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt,
    });

    const history = readStorageValue(STORAGE_KEYS.reviewHistory, [], isArray) as VocabularyReviewRecord[];
    history.push({
      id: generateId('review'),
      vocabularyId,
      reviewedAt: new Date().toISOString(),
      rating,
      wasCorrect,
      reviewType,
    });
    writeStorageValue(STORAGE_KEYS.reviewHistory, history);
  },

  getReviewHistory(): VocabularyReviewRecord[] {
    return readStorageValue(STORAGE_KEYS.reviewHistory, [], isArray) as VocabularyReviewRecord[];
  },
};
