import React from 'react';
import { AlertTriangle, Save, X } from 'lucide-react';

interface SaveReminderModalProps {
  open: boolean;
  questTitle: string;
  warnings: string[];
  onClose: () => void;
  onConfirmProceed?: () => void;
}

export const SaveReminderModal: React.FC<SaveReminderModalProps> = ({
  open,
  questTitle,
  warnings,
  onClose,
  onConfirmProceed,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-reminder-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[var(--accent-crimson)]/50 bg-[var(--bg-surface)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[var(--accent-crimson)]">
            <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <h2 id="save-reminder-title" className="font-display text-lg font-semibold">
              Salve em Slot Separado Antes
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Fechar lembrete"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-sm text-[var(--text-primary)] leading-relaxed">
          A etapa <strong>{questTitle}</strong> possui risco conhecido de bug, travamento de diálogo ou combate perigoso.
        </p>

        <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3 text-sm text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--accent-gold)] flex items-center gap-1.5 mb-1.5">
            <Save className="w-4 h-4" aria-hidden="true" />
            Recomendação do guia:
          </p>
          <ul className="space-y-1 list-disc pl-4">
            <li>Crie um <strong>salvamento manual novo</strong> (não dependa apenas de quicksave/autosave).</li>
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px]"
          >
            Fechar
          </button>
          {onConfirmProceed && (
            <button
              type="button"
              onClick={() => {
                onConfirmProceed();
                onClose();
              }}
              className="rounded-lg bg-[var(--accent-emerald)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 min-h-[44px]"
            >
              Já salvei — continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
