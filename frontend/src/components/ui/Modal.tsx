import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closable?: boolean;
}

export function Modal({ open, onClose, title, children, closable = true }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar"
        onClick={closable ? onClose : undefined}
        disabled={!closable}
        className="fixed inset-0 bg-black/40 disabled:cursor-not-allowed"
      />
      <div className="relative z-10 w-full max-w-lg border border-line bg-surface p-6 dark:border-line-night dark:bg-surface-night">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink dark:text-paper">
            {title}
          </h2>
          <button
            type="button"
            onClick={closable ? onClose : undefined}
            disabled={!closable}
            aria-label="Fechar"
            className="text-ink/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 dark:text-paper/40 dark:hover:text-paper"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
