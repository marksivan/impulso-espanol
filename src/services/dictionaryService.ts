import type { DictionaryResult } from '../types';
import { lookupLemma } from '../data/vocabulary/lemmas';
import { translateText } from './translationService';

const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries';

export class DictionaryError extends Error {
  code: 'not-found' | 'network' | 'invalid';

  constructor(message: string, code: 'not-found' | 'network' | 'invalid') {
    super(message);
    this.name = 'DictionaryError';
    this.code = code;
  }
}

interface DictApiEntry {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string }[];
  meanings?: {
    partOfSpeech?: string;
    definitions?: { definition?: string; example?: string }[];
  }[];
}

export async function lookupWord(
  word: string,
  language: 'es' | 'en',
): Promise<DictionaryResult> {
  const cleaned = word.trim().toLowerCase().replace(/^["¿¡(]+|["?!).,;:]+$/g, '');
  if (!cleaned) {
    throw new DictionaryError('Please enter a word to look up.', 'invalid');
  }

  const baseForm = lookupLemma(cleaned);
  const definitions: string[] = [];
  const examples: string[] = [];
  const relatedMeanings: string[] = [];
  let partOfSpeech: string | undefined;
  let pronunciation: string | undefined;

  if (language === 'en') {
    try {
      const response = await fetch(`${DICT_API}/en/${encodeURIComponent(cleaned)}`);
      if (response.ok) {
        const entries = (await response.json()) as DictApiEntry[];
        for (const entry of entries) {
          pronunciation = pronunciation ?? entry.phonetic ?? entry.phonetics?.[0]?.text;
          for (const meaning of entry.meanings ?? []) {
            partOfSpeech = partOfSpeech ?? meaning.partOfSpeech;
            for (const def of meaning.definitions ?? []) {
              if (def.definition) definitions.push(def.definition);
              if (def.example) examples.push(def.example);
            }
          }
        }
      }
    } catch {
      // Fall through to translation
    }
  }

  let translation: string | undefined;
  try {
    const targetLang = language === 'es' ? 'en' : 'es';
    const result = await translateText({
      text: cleaned,
      sourceLanguage: language,
      targetLanguage: targetLang,
    });
    translation = result.translatedText;
    if (definitions.length === 0) {
      definitions.push(translation);
    }
  } catch {
    if (definitions.length === 0) {
      throw new DictionaryError(
        language === 'es'
          ? 'Word not found. Try a different form or check spelling.'
          : 'Word not found in dictionary.',
        'not-found',
      );
    }
  }

  if (baseForm) {
    relatedMeanings.push(`Base form: ${baseForm}`);
  }

  return {
    word: cleaned,
    baseForm,
    partOfSpeech,
    definitions,
    translation,
    pronunciation,
    examples: examples.slice(0, 3),
    relatedMeanings,
    commonPhrases: [],
    sourceLabel:
      language === 'en' && definitions.length > 1
        ? 'Free Dictionary API'
        : 'Machine translation (supplemented)',
  };
}
