import { useState, useMemo } from 'react';
import { vocabularyRepository } from '../repositories/vocabularyRepository';
import { useProgressData } from '../hooks/useProgressData';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CONFIDENCE_LABELS } from '../constants';
import { useApp } from '../context/AppContext';

export function VocabularyPage() {
  const { vocabulary } = useProgressData();
  const { refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'alpha' | 'confidence'>('recent');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [manualTerm, setManualTerm] = useState('');
  const [manualTranslation, setManualTranslation] = useState('');

  const filtered = useMemo(() => {
    let items = [...vocabulary];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (v) =>
          v.term.toLowerCase().includes(q) ||
          v.translation.toLowerCase().includes(q) ||
          v.notes?.toLowerCase().includes(q),
      );
    }
    if (confidenceFilter) {
      items = items.filter((v) => v.confidence === Number(confidenceFilter));
    }
    if (sortBy === 'alpha') items.sort((a, b) => a.term.localeCompare(b.term));
    else if (sortBy === 'confidence') items.sort((a, b) => a.confidence - b.confidence);
    else items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  }, [vocabulary, search, confidenceFilter, sortBy]);

  function handleSaveManual() {
    if (!manualTerm.trim() || !manualTranslation.trim()) return;
    vocabularyRepository.saveWord({
      sourceLanguage: 'es',
      term: manualTerm.trim(),
      translation: manualTranslation.trim(),
    });
    setManualTerm('');
    setManualTranslation('');
    refreshData();
  }

  function handleDelete(id: string) {
    vocabularyRepository.deleteWord(id);
    refreshData();
  }

  function handleSaveNotes(id: string) {
    vocabularyRepository.updateWord(id, { notes: editNotes });
    setEditingId(null);
    refreshData();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold m-0">Vocabulary</h1>
        <p className="text-[var(--color-text-muted)] m-0 mt-1">
          Your personal phrase and word library.
        </p>
      </header>

      <Card title="Add manually">
        <div className="flex flex-wrap gap-2">
          <input
            className="flex-1 min-w-[140px] p-2 border border-[var(--color-border)] rounded-lg"
            placeholder="Spanish term or phrase"
            value={manualTerm}
            onChange={(e) => setManualTerm(e.target.value)}
          />
          <input
            className="flex-1 min-w-[140px] p-2 border border-[var(--color-border)] rounded-lg"
            placeholder="Translation"
            value={manualTranslation}
            onChange={(e) => setManualTranslation(e.target.value)}
          />
          <Button onClick={handleSaveManual}>Save</Button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search vocabulary..."
          className="flex-1 min-w-[200px] p-2 border border-[var(--color-border)] rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 border border-[var(--color-border)] rounded-lg"
          value={confidenceFilter}
          onChange={(e) => setConfidenceFilter(e.target.value)}
        >
          <option value="">All confidence</option>
          {([0, 1, 2, 3, 4] as const).map((c) => (
            <option key={c} value={c}>
              {CONFIDENCE_LABELS[c]}
            </option>
          ))}
        </select>
        <select
          className="p-2 border border-[var(--color-border)] rounded-lg"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
        >
          <option value="recent">Most recent</option>
          <option value="alpha">Alphabetical</option>
          <option value="confidence">Confidence</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No saved vocabulary"
          description="Tap words in lesson passages or save translations to build your library."
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((v) => (
            <Card key={v.id}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-1">
                    <span className="font-semibold text-lg">{v.term}</span>
                    <Badge>{CONFIDENCE_LABELS[v.confidence]}</Badge>
                  </div>
                  <p className="text-[var(--color-text-muted)] m-0">{v.translation}</p>
                  {v.sourceSentence && (
                    <p className="text-sm italic mt-2 m-0">&ldquo;{v.sourceSentence}&rdquo;</p>
                  )}
                  {v.notes && editingId !== v.id && (
                    <p className="text-sm mt-2 m-0">Note: {v.notes}</p>
                  )}
                  {editingId === v.id && (
                    <textarea
                      className="w-full mt-2 p-2 border rounded-lg text-sm"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={2}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {editingId === v.id ? (
                    <Button size="sm" onClick={() => handleSaveNotes(v.id)}>
                      Save
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(v.id);
                        setEditNotes(v.notes ?? '');
                      }}
                    >
                      Edit notes
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(v.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
