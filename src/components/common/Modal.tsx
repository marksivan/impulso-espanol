import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmVariant?: 'primary' | 'danger';
  cancelLabel?: string;
  size?: 'md' | 'lg';
}

const SIZE_CLASS = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
} as const;

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmLabel,
  onConfirm,
  confirmVariant = 'primary',
  cancelLabel = 'Cancel',
  size = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`${SIZE_CLASS[size]} w-full max-h-[85vh] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-xl flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[var(--color-border)] shrink-0">
          <h2 id="modal-title" className="text-lg font-semibold m-0">
            {title}
          </h2>
        </div>
        <div className="p-5 flex-1 overflow-y-auto">{children}</div>
        <div className="p-5 border-t border-[var(--color-border)] flex gap-3 justify-end shrink-0">
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          {confirmLabel && onConfirm && (
            <Button variant={confirmVariant} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
