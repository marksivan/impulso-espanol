import type { TranslationResult } from '../types';
import { MAX_TRANSLATION_CHARS } from '../constants';
import { translationHistoryRepository } from '../repositories/dataRepository';

const API_BASE = 'https://api.mymemory.translated.net/get';

const cache = new Map<string, TranslationResult>();

function cacheKey(text: string, source: string, target: string): string {
  return `${source}|${target}|${text}`;
}

export interface TranslateParams {
  text: string;
  sourceLanguage: 'es' | 'en';
  targetLanguage: 'es' | 'en';
}

export class TranslationError extends Error {
  code: 'empty' | 'too-long' | 'network' | 'quota' | 'invalid-response' | 'offline';

  constructor(
    message: string,
    code: 'empty' | 'too-long' | 'network' | 'quota' | 'invalid-response' | 'offline',
  ) {
    super(message);
    this.name = 'TranslationError';
    this.code = code;
  }
}

export async function translateText(params: TranslateParams): Promise<TranslationResult> {
  const { text, sourceLanguage, targetLanguage } = params;
  const trimmed = text.trim();

  if (!trimmed) {
    throw new TranslationError('Please enter text to translate.', 'empty');
  }

  if (trimmed.length > MAX_TRANSLATION_CHARS) {
    throw new TranslationError(
      `Text exceeds the ${MAX_TRANSLATION_CHARS} character limit.`,
      'too-long',
    );
  }

  if (!navigator.onLine) {
    throw new TranslationError('You appear to be offline. Check your connection.', 'offline');
  }

  const key = cacheKey(trimmed, sourceLanguage, targetLanguage);
  const cached = cache.get(key);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  const langpair = `${sourceLanguage}|${targetLanguage}`;
  const url = `${API_BASE}?q=${encodeURIComponent(trimmed)}&langpair=${langpair}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new TranslationError('Network error. Please try again.', 'network');
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new TranslationError('Translation service quota exceeded. Try again later.', 'quota');
    }
    throw new TranslationError('Translation service unavailable.', 'network');
  }

  const data: unknown = await response.json();
  if (typeof data !== 'object' || data === null) {
    throw new TranslationError('Invalid response from translation service.', 'invalid-response');
  }

  const obj = data as Record<string, unknown>;
  const responseData = obj.responseData as Record<string, unknown> | undefined;
  const translatedText = responseData?.translatedText;

  if (typeof translatedText !== 'string' || !translatedText) {
    throw new TranslationError('Could not translate this text.', 'invalid-response');
  }

  if (translatedText.includes('MYMEMORY WARNING') || translatedText.includes('QUOTA')) {
    throw new TranslationError('Daily translation limit reached. Try again tomorrow.', 'quota');
  }

  const result: TranslationResult = {
    sourceText: trimmed,
    translatedText,
    sourceLanguage,
    targetLanguage,
    isMachineGenerated: true,
    fromCache: false,
  };

  cache.set(key, result);

  translationHistoryRepository.addRecord({
    id: `trans_${Date.now()}`,
    sourceText: trimmed,
    translatedText,
    sourceLanguage,
    targetLanguage,
    translatedAt: new Date().toISOString(),
    isMachineGenerated: true,
  });

  return result;
}

export function clearTranslationCache(): void {
  cache.clear();
}
