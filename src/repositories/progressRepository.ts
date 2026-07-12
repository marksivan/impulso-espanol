import type {
  UserProfile,
  UserSettings,
  LessonProgressRecord,
  QuestionAttempt,
  SkillMasteryRecord,
  PlacementResult,
  StudySession,
} from '../types';
import { STORAGE_KEYS } from './storageKeys';
import { readStorageValue, writeStorageValue, removeStorageValue } from '../utilities/storage';
import { calculateSkillMastery } from '../utilities/skillMastery';
import { generateId } from '../utilities/helpers';
import { DEFAULT_LEVEL } from '../constants';

const DEFAULT_PROFILE: UserProfile = {
  id: generateId('profile'),
  displayName: 'Learner',
  currentLevel: DEFAULT_LEVEL,
  preferredDifficulty: 'standard',
  placementCompleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  studyDays: [],
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  passageFontSize: 'medium',
  preferredDifficulty: 'standard',
  defaultQuestionLanguage: 'es',
  translationAssistance: 'always-available',
  challengeMode: false,
  autoAdvanceAfterCorrect: false,
  showExplanationsImmediately: true,
  dailyStudyTargetMinutes: 20,
  readingFocusMode: false,
};

function isArray(data: unknown): data is unknown[] {
  return Array.isArray(data);
}

export interface ProgressRepository {
  getProfile(): UserProfile;
  updateProfile(updates: Partial<UserProfile>): UserProfile;
  getLessonProgress(): LessonProgressRecord[];
  getProgressForLesson(lessonId: string): LessonProgressRecord | null;
  saveLessonProgress(record: LessonProgressRecord): void;
  completeLesson(record: LessonProgressRecord): void;
  saveQuestionAttempt(attempt: QuestionAttempt): void;
  getQuestionAttempts(): QuestionAttempt[];
  getSkillMastery(): SkillMasteryRecord[];
  getPlacementResult(): PlacementResult | null;
  savePlacementResult(result: PlacementResult): void;
  getStudySessions(): StudySession[];
  saveStudySession(session: StudySession): void;
  recordStudyDay(): void;
}

export const progressRepository: ProgressRepository = {
  getProfile(): UserProfile {
    return readStorageValue(STORAGE_KEYS.profile, DEFAULT_PROFILE);
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    writeStorageValue(STORAGE_KEYS.profile, updated);
    return updated;
  },

  getLessonProgress(): LessonProgressRecord[] {
    return readStorageValue(STORAGE_KEYS.lessonProgress, [], isArray) as LessonProgressRecord[];
  },

  getProgressForLesson(lessonId: string): LessonProgressRecord | null {
    return this.getLessonProgress().find((p) => p.lessonId === lessonId) ?? null;
  },

  saveLessonProgress(record: LessonProgressRecord): void {
    const all = this.getLessonProgress();
    const index = all.findIndex((p) => p.lessonId === record.lessonId);
    if (index >= 0) {
      all[index] = record;
    } else {
      all.push(record);
    }
    writeStorageValue(STORAGE_KEYS.lessonProgress, all);
  },

  completeLesson(record: LessonProgressRecord): void {
    const completed = {
      ...record,
      completedAt: record.completedAt ?? new Date().toISOString(),
      progressPercentage: 100,
    };
    this.saveLessonProgress(completed);
    this.recordStudyDay();
  },

  saveQuestionAttempt(attempt: QuestionAttempt): void {
    const all = readStorageValue(STORAGE_KEYS.questionAttempts, [], isArray) as QuestionAttempt[];
    all.push(attempt);
    writeStorageValue(STORAGE_KEYS.questionAttempts, all);

    const mastery = calculateSkillMastery(all);
    writeStorageValue(STORAGE_KEYS.skillMastery, mastery);
  },

  getQuestionAttempts(): QuestionAttempt[] {
    return readStorageValue(STORAGE_KEYS.questionAttempts, [], isArray) as QuestionAttempt[];
  },

  getSkillMastery(): SkillMasteryRecord[] {
    const stored = readStorageValue(STORAGE_KEYS.skillMastery, [], isArray);
    if (stored.length > 0) return stored as SkillMasteryRecord[];
    return calculateSkillMastery(this.getQuestionAttempts());
  },

  getPlacementResult(): PlacementResult | null {
    return readStorageValue(STORAGE_KEYS.placementResult, null);
  },

  savePlacementResult(result: PlacementResult): void {
    writeStorageValue(STORAGE_KEYS.placementResult, result);
    this.updateProfile({
      placementCompleted: true,
      currentLevel: result.overrideLevel ?? result.recommendedLevel,
    });
  },

  getStudySessions(): StudySession[] {
    return readStorageValue(STORAGE_KEYS.studySessions, [], isArray) as StudySession[];
  },

  saveStudySession(session: StudySession): void {
    const all = this.getStudySessions();
    all.push(session);
    writeStorageValue(STORAGE_KEYS.studySessions, all);
  },

  recordStudyDay(): void {
    const today = new Date().toISOString().split('T')[0];
    const profile = this.getProfile();
    if (!profile.studyDays.includes(today)) {
      this.updateProfile({ studyDays: [...profile.studyDays, today] });
    }
  },
};

export interface SettingsRepository {
  getSettings(): UserSettings;
  updateSettings(updates: Partial<UserSettings>): UserSettings;
  resetSettings(): UserSettings;
}

export const settingsRepository: SettingsRepository = {
  getSettings(): UserSettings {
    return readStorageValue(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  },

  updateSettings(updates: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    writeStorageValue(STORAGE_KEYS.settings, updated);
    return updated;
  },

  resetSettings(): UserSettings {
    writeStorageValue(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },
};

export function resetAllProgress(): void {
  Object.values(STORAGE_KEYS).forEach((key) => removeStorageValue(key));
}
