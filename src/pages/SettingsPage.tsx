import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { settingsRepository } from '../repositories/progressRepository';
import {
  exportAllProgress,
  importProgress,
  resetAllProgress,
} from '../repositories/dataRepository';
import { createExportFilename } from '../utilities/exportImport';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { DIFFICULTY_LABELS } from '../constants';
import { LEVELS } from '../data/levels';
import { progressRepository } from '../repositories/progressRepository';
import { getLevelSelectLabel } from '../utilities/levelUtils';
import type { DifficultyPreference, ThemeMode, TranslationAssistance, LevelId } from '../types';

export function SettingsPage() {
  const { settings, updateSettings, refreshData } = useApp();
  const [importError, setImportError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [pendingImport, setPendingImport] = useState<unknown>(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<LevelId | null>(null);
  const profile = progressRepository.getProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const data = exportAllProgress();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = createExportFilename();
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        setPendingImport(data);
        setShowImportModal(true);
        setImportError(null);
      } catch {
        setImportError('Invalid JSON file. Please select a valid export file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function confirmImport() {
    const result = importProgress(pendingImport);
    if (result.success) {
      setShowImportModal(false);
      setPendingImport(null);
      refreshData();
      window.location.reload();
    } else {
      setImportError(result.error ?? 'Import failed');
      setShowImportModal(false);
    }
  }

  function confirmReset() {
    resetAllProgress();
    settingsRepository.resetSettings();
    setShowResetModal(false);
    refreshData();
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold m-0">Settings</h1>
        <p className="text-[var(--color-text-muted)] m-0 mt-1">
          Customize your learning experience.
        </p>
      </header>

      <Card title="Current learning level">
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          Changing your level changes lesson recommendations. It does not erase your progress.
        </p>
        <p className="font-medium mb-3">{getLevelSelectLabel(profile.currentLevel)}</p>
        <label className="block">
          <span className="text-sm font-medium">Select level</span>
          <select
            className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg"
            value={profile.currentLevel}
            onChange={(e) => {
              const level = e.target.value as LevelId;
              if (level !== profile.currentLevel) {
                setPendingLevel(level);
                setShowLevelModal(true);
              }
            }}
          >
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {getLevelSelectLabel(l.id as LevelId)}
              </option>
            ))}
          </select>
        </label>
      </Card>

      <Card title="Appearance">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Theme</span>
            <select
              className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg"
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as ThemeMode })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Passage font size</span>
            <select
              className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg"
              value={settings.passageFontSize}
              onChange={(e) =>
                updateSettings({
                  passageFontSize: e.target.value as typeof settings.passageFontSize,
                })
              }
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra large</option>
            </select>
          </label>
        </div>
      </Card>

      <Card title="Learning preferences">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Preferred difficulty</span>
            <select
              className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg"
              value={settings.preferredDifficulty}
              onChange={(e) =>
                updateSettings({
                  preferredDifficulty: e.target.value as DifficultyPreference,
                })
              }
            >
              {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Translation assistance</span>
            <select
              className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg"
              value={settings.translationAssistance}
              onChange={(e) =>
                updateSettings({
                  translationAssistance: e.target.value as TranslationAssistance,
                })
              }
            >
              <option value="always-available">Always available</option>
              <option value="after-first-attempt">Available after first attempt</option>
              <option value="challenge-mode">Hidden in Challenge Mode</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.challengeMode}
              onChange={(e) => updateSettings({ challengeMode: e.target.checked })}
            />
            <span className="text-sm">Challenge Mode</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.autoAdvanceAfterCorrect}
              onChange={(e) => updateSettings({ autoAdvanceAfterCorrect: e.target.checked })}
            />
            <span className="text-sm">Auto-advance after correct answers</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showExplanationsImmediately}
              onChange={(e) => updateSettings({ showExplanationsImmediately: e.target.checked })}
            />
            <span className="text-sm">Show explanations immediately</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.readingFocusMode}
              onChange={(e) => updateSettings({ readingFocusMode: e.target.checked })}
            />
            <span className="text-sm">Reading focus mode</span>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Daily study target (minutes)</span>
            <input
              type="number"
              min={5}
              max={120}
              className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg"
              value={settings.dailyStudyTargetMinutes}
              onChange={(e) =>
                updateSettings({ dailyStudyTargetMinutes: Number(e.target.value) })
              }
            />
          </label>
        </div>
      </Card>

      <Card title="Data management">
        <div className="space-y-3">
          <div>
            <Button onClick={handleExport}>Export progress</Button>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Download all your data as a JSON file.
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              id="import-file"
              onChange={handleFileSelect}
            />
            <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
              Import progress
            </Button>
            {importError && (
              <p className="text-[var(--color-error)] text-sm mt-1" role="alert">
                {importError}
              </p>
            )}
          </div>
          <div className="pt-3 border-t border-[var(--color-border)]">
            <Button variant="danger" onClick={() => setShowResetModal(true)}>
              Reset all progress
            </Button>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              This permanently deletes all saved progress. Export first if you want a backup.
            </p>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showLevelModal}
        onClose={() => {
          setShowLevelModal(false);
          setPendingLevel(null);
        }}
        title="Change learning level?"
        confirmLabel="Change level"
        onConfirm={() => {
          if (pendingLevel) {
            progressRepository.updateProfile({ currentLevel: pendingLevel });
            refreshData();
          }
          setShowLevelModal(false);
          setPendingLevel(null);
        }}
      >
        <p>
          Your lesson history, vocabulary, and progress will be preserved. Only recommendations
          will update to match {pendingLevel && getLevelSelectLabel(pendingLevel)}.
        </p>
      </Modal>

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import progress?"
        confirmLabel="Replace current data"
        confirmVariant="danger"
        onConfirm={confirmImport}
      >
        <p>
          This will replace all your current progress with the imported data. This action cannot
          be undone unless you have another export.
        </p>
      </Modal>

      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset all progress?"
        confirmLabel="Yes, delete everything"
        confirmVariant="danger"
        onConfirm={confirmReset}
      >
        <p>
          This will permanently delete all lessons progress, vocabulary, mistakes, settings, and
          translation history. Consider exporting your data first.
        </p>
      </Modal>
    </div>
  );
}
