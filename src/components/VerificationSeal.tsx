import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { ConfidenceTier } from '../types/grimoire';

interface VerificationSealProps {
  needsVerification?: boolean;
  confidenceTier?: ConfidenceTier;
  note?: string;
}

export const VerificationSeal: React.FC<VerificationSealProps> = ({
  needsVerification = false,
  confidenceTier,
  note,
}) => {
  const requiresInGameCheck =
    needsVerification || confidenceTier === 'C' || confidenceTier === 'A/C';

  if (!requiresInGameCheck && confidenceTier !== 'B') {
    return null;
  }

  if (requiresInGameCheck) {
    return (
      <span
        title={note ?? 'Registro classificado no dossiê como pendente de conferência in-game.'}
        className="inline-flex items-center gap-1 rounded-md border border-[var(--accent-gold)]/55 bg-[var(--accent-gold)]/12 px-2 py-0.5 text-[11px] font-semibold text-[var(--accent-gold)] whitespace-nowrap"
      >
        <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
        <span>
          Verificar no jogo{confidenceTier ? ` [${confidenceTier}]` : ''}
        </span>
      </span>
    );
  }

  return (
    <span
      title={note ?? 'Confirmado apenas em fonte secundária (Fextralife/GameBanshee).'}
      className="inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)] whitespace-nowrap"
    >
      <span>Fonte secundária [B]</span>
    </span>
  );
};
