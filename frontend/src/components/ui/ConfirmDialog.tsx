import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { ProgressBar } from "./ProgressBar";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmLabel?: string;
  confirmando?: boolean;
  danger?: boolean;
  children: ReactNode;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  confirmLabel = "Confirmar",
  confirmando = false,
  danger = true,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} closable={!confirmando}>
      <div className="space-y-4">
        <div className="text-sm text-foreground/70">
          {children}
        </div>
        {confirmando && <ProgressBar label="Aguarde, processando..." />}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={confirmando}>
            Cancelar
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={confirmando}
          >
            {confirmando ? "Aguarde..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
