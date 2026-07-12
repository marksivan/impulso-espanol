import { STORAGE_SCHEMA_VERSION } from '../constants';
import type { StorageEnvelope } from '../types';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidEnvelope<T>(
  value: unknown,
  validateData: (data: unknown) => data is T,
): value is StorageEnvelope<T> {
  if (!isObject(value)) return false;
  if (typeof value.version !== 'number') return false;
  if (typeof value.updatedAt !== 'string') return false;
  return validateData(value.data);
}

export function createEnvelope<T>(data: T): StorageEnvelope<T> {
  return {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    data,
  };
}

export function readStorageValue<T>(
  key: string,
  fallback: T,
  validateData?: (data: unknown) => data is T,
): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed: unknown = JSON.parse(raw);

    if (validateData) {
      if (isValidEnvelope(parsed, validateData)) {
        return parsed.data;
      }
      if (validateData(parsed)) {
        return parsed;
      }
      console.warn(`[storage] Invalid shape for key "${key}", using fallback`);
      return fallback;
    }

    if (
      isObject(parsed) &&
      typeof parsed.version === 'number' &&
      typeof parsed.updatedAt === 'string' &&
      'data' in parsed
    ) {
      return parsed.data as T;
    }

    return parsed as T;
  } catch (error) {
    console.error(`[storage] Failed to read key "${key}"`, error);
    return fallback;
  }
}

export function writeStorageValue<T>(key: string, value: T): void {
  try {
    const envelope = createEnvelope(value);
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch (error) {
    console.error(`[storage] Failed to write key "${key}"`, error);
  }
}

export function removeStorageValue(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[storage] Failed to remove key "${key}"`, error);
  }
}

export function readRawEnvelope<T>(key: string): StorageEnvelope<T> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed)) return null;
    if (typeof parsed.version !== 'number' || typeof parsed.updatedAt !== 'string') {
      return null;
    }
    return parsed as unknown as StorageEnvelope<T>;
  } catch {
    return null;
  }
}
