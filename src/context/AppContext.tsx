import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { UserSettings } from '../types';
import { settingsRepository } from '../repositories/progressRepository';
import { FONT_SIZE_MAP } from '../constants';

interface AppContextValue {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  refreshData: () => void;
  dataVersion: number;
}

const AppContext = createContext<AppContextValue | null>(null);

function applyTheme(theme: UserSettings['theme']) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    root.removeAttribute('data-theme');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(settingsRepository.getSettings());
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    applyTheme(settings.theme);
    document.documentElement.style.setProperty(
      '--passage-font-size',
      FONT_SIZE_MAP[settings.passageFontSize],
    );
  }, [settings.theme, settings.passageFontSize]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (settings.theme === 'system') applyTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.theme]);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    const updated = settingsRepository.updateSettings(updates);
    setSettings(updated);
  }, []);

  const refreshData = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  return (
    <AppContext.Provider value={{ settings, updateSettings, refreshData, dataVersion }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
