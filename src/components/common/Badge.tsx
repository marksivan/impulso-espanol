import type React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'level';
}

const variants = {
  default: 'bg-[var(--color-border)] text-[var(--color-text)]',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-error-bg)] text-[var(--color-error)]',
  level: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
