import { NavLink, Outlet } from 'react-router-dom';
import { APP_NAME } from '../../constants';
import { ThemeToggle } from '../common/ThemeToggle';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/learn', label: 'Learn', icon: '📖' },
  { to: '/review', label: 'Review', icon: '🔄' },
  { to: '/vocabulary', label: 'Vocabulary', icon: '📝' },
  { to: '/translator', label: 'Translator', icon: '🌐' },
  { to: '/progress', label: 'Progress', icon: '📊' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-[var(--color-primary)] text-white'
            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]'
        }`
      }
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </NavLink>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="hidden md:flex md:flex-col md:w-56 lg:w-64 border-r border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shrink-0">
        <div className="mb-8 px-2 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-primary)] m-0">{APP_NAME}</h1>
            <p className="text-xs text-[var(--color-text-muted)] m-0 mt-1">A1–B2 Spanish</p>
          </div>
          <ThemeToggle />
        </div>
        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <div>
            <h1 className="text-lg font-bold text-[var(--color-primary)] m-0">{APP_NAME}</h1>
            <p className="text-xs text-[var(--color-text-muted)] m-0">A1–B2 Spanish</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-6 max-w-5xl mx-auto w-full">
          <Outlet />
        </main>

        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around border-t border-[var(--color-border)] bg-[var(--color-bg-card)] py-2 z-40"
          aria-label="Mobile navigation"
        >
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
                  isActive ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-text-muted)]'
                }`
              }
            >
              <span className="text-lg" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
