import { useApp } from '../../context/AppContext';
import type { ThemeMode } from '../../types';

function getEffectiveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { settings, updateSettings } = useApp();
  const effectiveTheme = getEffectiveTheme(settings.theme);
  const isDark = effectiveTheme === 'dark';

  function toggleTheme() {
    updateSettings({ theme: isDark ? 'light' : 'dark' });
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-border)] transition-colors shrink-0 ${className}`}
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
    </button>
  );
}
