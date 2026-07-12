import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <section
      className={`bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 shadow-sm ${className}`}
    >
      {title && <h2 className="text-lg font-semibold text-[var(--color-text)] m-0 mb-1">{title}</h2>}
      {subtitle && (
        <p className="text-sm text-[var(--color-text-muted)] m-0 mb-4">{subtitle}</p>
      )}
      {children}
    </section>
  );
}
