import type { ProgressExport, TranslationRecord } from '../types';
import { STORAGE_KEYS } from './storageKeys';
import { readStorageValue, writeStorageValue } from '../utilities/storage';
import { EXPORT_VERSION, MAX_TRANSLATION_HISTORY } from '../constants';
import { progressRepository, settingsRepository, resetAllProgress } from './progressRepository';
import { vocabularyRepository } from './vocabularyRepository';
import { reviewRepository } from './reviewRepository';
import { validateImportData } from '../utilities/exportImport';

function isArray(data: unknown): data is unknown[] {
  return Array.isArray(data);
}

export interface TranslationHistoryRepository {
  getHistory(): TranslationRecord[];
  addRecord(record: TranslationRecord): void;
  clearHistory(): void;
}

export const translationHistoryRepository: TranslationHistoryRepository = {
  getHistory(): TranslationRecord[] {
    return readStorageValue(STORAGE_KEYS.translationHistory, [], isArray) as TranslationRecord[];
  },

  addRecord(record): void {
    const history = this.getHistory();
    const exists = history.find(
      (h) =>
        h.sourceText === record.sourceText &&
        h.sourceLanguage === record.sourceLanguage &&
        h.targetLanguage === record.targetLanguage,
    );
    if (exists) return;

    history.unshift(record);
    if (history.length > MAX_TRANSLATION_HISTORY) {
      history.length = MAX_TRANSLATION_HISTORY;
    }
    writeStorageValue(STORAGE_KEYS.translationHistory, history);
  },

  clearHistory(): void {
    writeStorageValue(STORAGE_KEYS.translationHistory, []);
  },
};

export function exportAllProgress(): ProgressExport {
  return {
    exportVersion: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    profile: progressRepository.getProfile(),
    placementResult: progressRepository.getPlacementResult(),
    lessonProgress: progressRepository.getLessonProgress(),
    questionAttempts: progressRepository.getQuestionAttempts(),
    savedVocabulary: vocabularyRepository.getAll(),
    reviewHistory: vocabularyRepository.getReviewHistory(),
    mistakeNotebook: reviewRepository.getMistakes(),
    skillMastery: progressRepository.getSkillMastery(),
    settings: settingsRepository.getSettings(),
    translationHistory: translationHistoryRepository.getHistory(),
  };
}

export function importProgress(data: unknown): { success: boolean; error?: string } {
  if (!validateImportData(data)) {
    return { success: false, error: 'Invalid or unsupported export file. Please use a valid Impulso Español export.' };
  }

  writeStorageValue(STORAGE_KEYS.profile, data.profile);
  writeStorageValue(STORAGE_KEYS.placementResult, data.placementResult);
  writeStorageValue(STORAGE_KEYS.lessonProgress, data.lessonProgress);
  writeStorageValue(STORAGE_KEYS.questionAttempts, data.questionAttempts);
  writeStorageValue(STORAGE_KEYS.savedVocabulary, data.savedVocabulary);
  writeStorageValue(STORAGE_KEYS.reviewHistory, data.reviewHistory);
  writeStorageValue(STORAGE_KEYS.mistakeNotebook, data.mistakeNotebook ?? []);
  writeStorageValue(STORAGE_KEYS.skillMastery, data.skillMastery);
  writeStorageValue(STORAGE_KEYS.settings, data.settings);
  writeStorageValue(STORAGE_KEYS.translationHistory, data.translationHistory);

  return { success: true };
}

export { resetAllProgress };
