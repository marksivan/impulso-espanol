import { useState } from 'react';
import { translateText, TranslationError } from '../services/translationService';
import { lookupWord, DictionaryError } from '../services/dictionaryService';
import { vocabularyRepository } from '../repositories/vocabularyRepository';
import { translationHistoryRepository } from '../repositories/dataRepository';
import { useProgressData } from '../hooks/useProgressData';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { MAX_TRANSLATION_CHARS } from '../constants';
import { useApp } from '../context/AppContext';

export function TranslatorPage() {
  const { translationHistory } = useProgressData();
  const { refreshData } = useApp();
  const [tab, setTab] = useState<'translate' | 'dictionary'>('translate');
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState<'es' | 'en'>('es');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dictWord, setDictWord] = useState('');
  const [dictLang, setDictLang] = useState<'es' | 'en'>('es');
  const [dictResult, setDictResult] = useState<Awaited<ReturnType<typeof lookupWord>> | null>(null);

  const targetLang = sourceLang === 'es' ? 'en' : 'es';

  async function handleTranslate() {
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const res = await translateText({
        text,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });
      setResult(res.translatedText);
      refreshData();
    } catch (err) {
      if (err instanceof TranslationError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLookup() {
    setLoading(true);
    setError(null);
    setDictResult(null);
    try {
      const res = await lookupWord(dictWord, dictLang);
      setDictResult(res);
    } catch (err) {
      if (err instanceof DictionaryError) {
        setError(err.message);
      } else {
        setError('Dictionary lookup failed.');
      }
    } finally {
      setLoading(false);
    }
  }

  function swapLanguages() {
    setSourceLang(targetLang);
    setText(result || text);
    setResult('');
  }

  function saveToVocabulary() {
    if (!result) return;
    vocabularyRepository.saveWord({
      sourceLanguage: sourceLang,
      term: text,
      translation: result,
    });
    refreshData();
  }

  function copyResult() {
    navigator.clipboard.writeText(result);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold m-0">Translator</h1>
        <p className="text-[var(--color-text-muted)] m-0 mt-1">
          Translate text or explore individual words.
        </p>
      </header>

      <div className="flex gap-2">
        <Button
          variant={tab === 'translate' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setTab('translate')}
        >
          Translate
        </Button>
        <Button
          variant={tab === 'dictionary' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setTab('dictionary')}
        >
          Word Explorer
        </Button>
      </div>

      {tab === 'translate' && (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">
              {sourceLang === 'es' ? 'Spanish' : 'English'} →{' '}
              {targetLang === 'es' ? 'Spanish' : 'English'}
            </span>
            <Button variant="ghost" size="sm" onClick={swapLanguages}>
              Swap
            </Button>
          </div>

          <textarea
            className="w-full p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] min-h-[100px]"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TRANSLATION_CHARS))}
            placeholder="Enter text to translate..."
            aria-label="Text to translate"
          />
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {text.length}/{MAX_TRANSLATION_CHARS} characters
          </p>

          <div className="flex gap-2 mt-3">
            <Button onClick={handleTranslate} disabled={loading || !text.trim()}>
              {loading ? 'Translating...' : 'Translate'}
            </Button>
            <Button variant="ghost" onClick={() => { setText(''); setResult(''); setError(null); }}>
              Clear
            </Button>
          </div>

          {error && (
            <p className="text-[var(--color-error)] mt-3" role="alert">
              {error}
            </p>
          )}

          {result && (
            <div className="mt-4 p-4 border border-[var(--color-border)] rounded-xl">
              <p className="m-0 mb-2">{result}</p>
              <p className="text-xs text-[var(--color-text-muted)] mb-3">
                Machine-generated translation
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={copyResult}>
                  Copy
                </Button>
                <Button size="sm" onClick={saveToVocabulary}>
                  Save to vocabulary
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {tab === 'dictionary' && (
        <Card title="Word Explorer">
          <div className="flex gap-2 mb-3">
            <select
              className="p-2 border border-[var(--color-border)] rounded-lg"
              value={dictLang}
              onChange={(e) => setDictLang(e.target.value as 'es' | 'en')}
            >
              <option value="es">Spanish</option>
              <option value="en">English</option>
            </select>
            <input
              className="flex-1 p-2 border border-[var(--color-border)] rounded-lg"
              value={dictWord}
              onChange={(e) => setDictWord(e.target.value)}
              placeholder="Enter a word..."
            />
            <Button onClick={handleLookup} disabled={loading || !dictWord.trim()}>
              Look up
            </Button>
          </div>

          {error && <p className="text-[var(--color-error)]" role="alert">{error}</p>}

          {dictResult && (
            <div className="space-y-2 text-sm">
              <p className="text-lg font-semibold">{dictResult.word}</p>
              {dictResult.pronunciation && <p>/{dictResult.pronunciation}/</p>}
              {dictResult.baseForm && <p>Base form: {dictResult.baseForm}</p>}
              {dictResult.partOfSpeech && <p>Part of speech: {dictResult.partOfSpeech}</p>}
              {dictResult.definitions.map((d, i) => (
                <p key={i}>{i + 1}. {d}</p>
              ))}
              {dictResult.examples.map((e, i) => (
                <p key={i} className="italic text-[var(--color-text-muted)]">&ldquo;{e}&rdquo;</p>
              ))}
              <p className="text-xs text-[var(--color-text-muted)]">{dictResult.sourceLabel}</p>
              <Button
                size="sm"
                onClick={() => {
                  vocabularyRepository.saveWord({
                    sourceLanguage: dictLang,
                    term: dictResult.word,
                    baseForm: dictResult.baseForm,
                    translation: dictResult.translation ?? dictResult.definitions[0] ?? '',
                    partOfSpeech: dictResult.partOfSpeech,
                    definition: dictResult.definitions.join('; '),
                  });
                  refreshData();
                }}
              >
                Save to vocabulary
              </Button>
            </div>
          )}
        </Card>
      )}

      <Card title="Translation history">
        {translationHistory.length === 0 ? (
          <EmptyState
            title="No translation history"
            description="Your recent translations will appear here."
            icon="🌐"
          />
        ) : (
          <ul className="space-y-2 m-0 p-0 list-none text-sm">
            {translationHistory.slice(0, 10).map((t) => (
              <li key={t.id} className="border-b border-[var(--color-border)] pb-2">
                <span className="text-[var(--color-text-muted)]">
                  {t.sourceLanguage}→{t.targetLanguage}:
                </span>{' '}
                {t.sourceText.slice(0, 60)}
                {t.sourceText.length > 60 ? '...' : ''} → {t.translatedText.slice(0, 60)}
              </li>
            ))}
          </ul>
        )}
        {translationHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => {
              translationHistoryRepository.clearHistory();
              refreshData();
            }}
          >
            Clear history
          </Button>
        )}
      </Card>
    </div>
  );
}
