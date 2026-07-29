import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="fixed inset-0 bg-black/40"
      />
      <div className="relative z-10 w-full max-w-lg border border-line bg-surface p-6 dark:border-line-night dark:bg-surface-night">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink dark:text-paper">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-ink/40 hover:text-ink dark:text-paper/40 dark:hover:text-paper"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
