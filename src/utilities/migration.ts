import type { UserProfile } from '../types';
import { DEFAULT_LEVEL, OLD_DEFAULT_LEVELS, STORAGE_SCHEMA_VERSION } from '../constants';
import { progressRepository } from '../repositories/progressRepository';
import { readRawEnvelope, writeStorageValue } from './storage';
import { STORAGE_KEYS } from '../repositories/storageKeys';

const MIGRATION_FLAG_KEY = 'spanishApp.migrationV2Applied';

let migrationInProgress = false;

function hasRealProgress(): boolean {
  const lessonProgress = progressRepository.getLessonProgress();
  const attempts = progressRepository.getQuestionAttempts();
  const placement = progressRepository.getPlacementResult();

  if (lessonProgress.length > 0) return true;
  if (attempts.length > 0) return true;
  if (placement?.completedAt) return true;
  return false;
}

function isUntouchedOldDefault(profile: UserProfile): boolean {
  if (profile.placementCompleted) return false;
  if (!OLD_DEFAULT_LEVELS.includes(profile.currentLevel)) return false;
  if (hasRealProgress()) return false;
  return true;
}

export function migrateProfileIfNeeded(profile: UserProfile): UserProfile {
  if (migrationInProgress) return profile;

  const migrationApplied = localStorage.getItem(MIGRATION_FLAG_KEY) === 'true';
  const profileEnvelope = readRawEnvelope<UserProfile>(STORAGE_KEYS.profile);
  const schemaVersion = profileEnvelope?.version ?? 1;

  if (schemaVersion >= STORAGE_SCHEMA_VERSION && migrationApplied) {
    return profile;
  }

  let updated = { ...profile };

  if (isUntouchedOldDefault(profile)) {
    updated = {
      ...updated,
      currentLevel: DEFAULT_LEVEL,
      updatedAt: new Date().toISOString(),
    };
    migrationInProgress = true;
    writeStorageValue(STORAGE_KEYS.profile, updated);
    migrationInProgress = false;
  }

  localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
  return updated;
}

export { isUntouchedOldDefault, hasRealProgress };
