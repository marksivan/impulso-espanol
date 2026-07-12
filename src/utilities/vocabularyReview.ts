import type { SavedVocabularyItem, VocabularyReviewRecord } from '../types';
import { EXTENDED_REVIEW_INTERVALS, REVIEW_INTERVALS } from '../constants';

export function getNextReviewDate(
  rating: 'again' | 'hard' | 'good' | 'easy',
  reviewCount: number,
): string {
  const now = new Date();
  let daysToAdd: number;

  if (rating === 'again') {
    now.setHours(now.getHours() + 4);
    return now.toISOString();
  }

  if (rating === 'hard') {
    daysToAdd = REVIEW_INTERVALS.hard;
  } else if (rating === 'good') {
    daysToAdd = REVIEW_INTERVALS.good;
  } else {
    daysToAdd = REVIEW_INTERVALS.easy;
  }

  if (reviewCount > 0) {
    const extendedIndex = Math.min(reviewCount - 1, EXTENDED_REVIEW_INTERVALS.length - 1);
    daysToAdd = Math.max(daysToAdd, EXTENDED_REVIEW_INTERVALS[extendedIndex]);
  }

  now.setDate(now.getDate() + daysToAdd);
  return now.toISOString();
}

export function updateConfidence(
  current: 0 | 1 | 2 | 3 | 4,
  rating: 'again' | 'hard' | 'good' | 'easy',
): 0 | 1 | 2 | 3 | 4 {
  if (rating === 'again') return Math.max(0, current - 1) as 0 | 1 | 2 | 3 | 4;
  if (rating === 'hard') return current;
  if (rating === 'good') return Math.min(4, current + 1) as 0 | 1 | 2 | 3 | 4;
  return Math.min(4, current + 2) as 0 | 1 | 2 | 3 | 4;
}

export function getDueVocabulary(items: SavedVocabularyItem[]): SavedVocabularyItem[] {
  const now = new Date().toISOString();
  return items.filter((item) => !item.nextReviewAt || item.nextReviewAt <= now);
}

export function createReviewRecord(
  vocabularyId: string,
  rating: 'again' | 'hard' | 'good' | 'easy',
  wasCorrect: boolean,
  reviewType: string,
): VocabularyReviewRecord {
  return {
    id: `review_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    vocabularyId,
    reviewedAt: new Date().toISOString(),
    rating,
    wasCorrect,
    reviewType,
  };
}
