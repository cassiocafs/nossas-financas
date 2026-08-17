import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closable?: boolean;
}

export function Modal({ open, onClose, title, children, closable = true }: ModalProps) {
  useEffect(() => {
    if (!open || !closable) return;
    function aoPressionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", aoPressionarTecla);
    return () => document.removeEventListener("keydown", aoPressionarTecla);
  }, [open, closable, onClose]);

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
      <div className="card-surface relative z-10 w-full max-w-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={closable ? onClose : undefined}
            disabled={!closable}
            aria-label="Fechar"
            className="text-foreground/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
