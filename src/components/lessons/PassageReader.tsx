import { useState } from 'react';
import type { Lesson } from '../../types';
import { lookupWord } from '../../services/dictionaryService';
import { vocabularyRepository } from '../../repositories/vocabularyRepository';
import { progressRepository } from '../../repositories/progressRepository';
import { tokenizeSpanishWord, getSentenceContainingWord } from '../../utilities/helpers';
import { SpeechControls } from '../common/SpeechControls';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

interface PassageReaderProps {
  lesson: Lesson;
  onWordLookup?: () => void;
}

export function PassageReader({ lesson, onWordLookup }: PassageReaderProps) {
  const { settings } = useApp();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<Awaited<ReturnType<typeof lookupWord>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedParagraphs, setRevealedParagraphs] = useState<Set<number>>(new Set());
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [note, setNote] = useState('');

  const fontSize = settings.passageFontSize;
  const sizeMap = { small: '0.95rem', medium: '1.1rem', large: '1.25rem', xlarge: '1.4rem' };

  async function handleWordClick(word: string) {
    const token = tokenizeSpanishWord(word);
    if (!token || token.length < 2) return;

    setSelectedWord(token);
    setLoading(true);
    setError(null);
    setNote('');

    try {
      const result = await lookupWord(token, 'es');
      setLookupResult(result);
      onWordLookup?.();

      const progress = progressRepository.getProgressForLesson(lesson.id);
      if (progress) {
        progressRepository.saveLessonProgress({
          ...progress,
          wordsLookedUp: progress.wordsLookedUp + 1,
          lastAccessedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
      setLookupResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSaveWord() {
    if (!lookupResult) return;
    vocabularyRepository.saveWord({
      sourceLanguage: 'es',
      term: lookupResult.word,
      baseForm: lookupResult.baseForm,
      translation: lookupResult.translation ?? lookupResult.definitions[0] ?? '',
      partOfSpeech: lookupResult.partOfSpeech,
      definition: lookupResult.definitions.join('; '),
      sourceLessonId: lesson.id,
      sourceSentence: getSentenceContainingWord(lesson.passage.text, lookupResult.word),
      notes: note || undefined,
    });
    setSelectedWord(null);
    setLookupResult(null);
  }

  function revealTranslation(index: number) {
    setRevealedParagraphs((prev) => new Set([...prev, index]));
    const progress = progressRepository.getProgressForLesson(lesson.id);
    if (progress) {
      progressRepository.saveLessonProgress({
        ...progress,
        paragraphTranslationsRevealed: progress.paragraphTranslationsRevealed + 1,
        lastAccessedAt: new Date().toISOString(),
      });
    }
  }

  const isA1 = lesson.level.startsWith('A1');

  const paragraphs = settings.readingFocusMode
    ? [lesson.passage.paragraphs[currentParagraph]]
    : lesson.passage.paragraphs;

  return (
    <div className={`flex gap-4 ${settings.readingFocusMode ? 'flex-col' : 'flex-col lg:flex-row'}`}>
      <article
        className={`flex-1 font-reading leading-relaxed ${
          settings.readingFocusMode ? 'max-w-2xl mx-auto' : ''
        } ${isA1 ? 'space-y-2' : ''}`}
        style={{ fontSize: sizeMap[fontSize], lineHeight: isA1 ? 1.8 : undefined }}
        aria-label="Spanish passage"
      >
        <SpeechControls text={lesson.passage.text} label="Listen to passage" className="mb-4" />
        {paragraphs.map((para, idx) => {
          const realIdx = settings.readingFocusMode ? currentParagraph : idx;
          return (
            <div key={realIdx} className={isA1 ? 'mb-8' : 'mb-6'}>
              <p className="m-0">
                {para.split(/(\s+)/).map((part, i) => {
                  if (/^\s+$/.test(part)) return part;
                  return (
                    <button
                      key={i}
                      type="button"
                      className="inline bg-transparent border-0 p-0 font-inherit text-inherit cursor-pointer hover:bg-[var(--color-accent)]/20 rounded-sm"
                      onClick={() => handleWordClick(part)}
                    >
                      {part}
                    </button>
                  );
                })}
              </p>
              {!settings.challengeMode && (
                <div className="mt-2">
                  {revealedParagraphs.has(realIdx) ? (
                    <p className="text-sm text-[var(--color-text-muted)] italic m-0">
                      [Machine translation available in full lesson mode]
                    </p>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revealTranslation(realIdx)}
                    >
                      Reveal paragraph translation
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {settings.readingFocusMode && lesson.passage.paragraphs.length > 1 && (
          <div className="flex gap-2 justify-between mt-4">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentParagraph === 0}
              onClick={() => setCurrentParagraph((p) => p - 1)}
            >
              Previous paragraph
            </Button>
            <span className="text-sm text-[var(--color-text-muted)] self-center">
              {currentParagraph + 1} / {lesson.passage.paragraphs.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentParagraph >= lesson.passage.paragraphs.length - 1}
              onClick={() => setCurrentParagraph((p) => p + 1)}
            >
              Next paragraph
            </Button>
          </div>
        )}
      </article>

      {selectedWord && (
        <aside
          className="lg:w-72 shrink-0 border border-[var(--color-border)] rounded-xl p-4 bg-[var(--color-bg-card)]"
          aria-label="Word lookup panel"
        >
          <h3 className="text-lg font-semibold m-0 mb-2">{selectedWord}</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-3">
            {getSentenceContainingWord(lesson.passage.text, selectedWord)}
          </p>

          {loading && <p className="text-sm">Looking up...</p>}
          {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

          {lookupResult && (
            <div className="space-y-2 text-sm">
              {lookupResult.baseForm && (
                <p>
                  <strong>Base form:</strong> {lookupResult.baseForm}
                </p>
              )}
              {lookupResult.translation && (
                <p>
                  <strong>Translation:</strong> {lookupResult.translation}
                </p>
              )}
              {lookupResult.definitions.slice(0, 2).map((d, i) => (
                <p key={i}>{d}</p>
              ))}
              <p className="text-xs text-[var(--color-text-muted)]">{lookupResult.sourceLabel}</p>

              <label className="block mt-3">
                <span className="text-xs font-medium">Personal note</span>
                <textarea
                  className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-sm"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>

              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleSaveWord}>
                  Save word
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedWord(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
