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
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmLabel,
  onConfirm,
  confirmVariant = 'primary',
  cancelLabel = 'Cancel',
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
        className="max-w-md w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[var(--color-border)]">
          <h2 id="modal-title" className="text-lg font-semibold m-0">
            {title}
          </h2>
        </div>
        <div className="p-5 flex-1">{children}</div>
        <div className="p-5 border-t border-[var(--color-border)] flex gap-3 justify-end">
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
