import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: string;
}

export function EmptyState({ title, description, action, icon = '📚' }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-4xl mb-4" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-[var(--color-text-muted)] max-w-md mx-auto mb-6">{description}</p>
      {action}
    </div>
  );
}
