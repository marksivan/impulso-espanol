import type { ProgressExport } from '../types';
import { EXPORT_VERSION } from '../constants';

export function validateImportData(data: unknown): data is ProgressExport {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.exportVersion !== 'number') return false;
  if (obj.exportVersion !== EXPORT_VERSION) return false;
  if (typeof obj.exportedAt !== 'string') return false;
  if (!Array.isArray(obj.lessonProgress)) return false;
  if (!Array.isArray(obj.questionAttempts)) return false;
  if (!Array.isArray(obj.savedVocabulary)) return false;
  if (!Array.isArray(obj.reviewHistory)) return false;
  if (!Array.isArray(obj.skillMastery)) return false;
  if (!Array.isArray(obj.translationHistory)) return false;
  if (typeof obj.settings !== 'object' || obj.settings === null) return false;
  return true;
}

export function createExportFilename(): string {
  const date = new Date().toISOString().split('T')[0];
  return `spanish-learning-progress-${date}.json`;
}
