import React from 'react';
import { AlertTriangle, BookOpen, Compass, ShieldAlert, Sparkles } from 'lucide-react';

export type CalloutType =
  | 'Dica de Iniciante'
  | 'Exploit e Otimizacao'
  | 'Alerta de Bug'
  | 'Regra de Ouro'
  | 'Teste antes da luta';

interface CalloutBoxProps {
  tipo: CalloutType;
  titulo?: string;
  children: React.ReactNode;
  sourcePage?: number;
}

const CALLOUT_CONFIG: Record<
  CalloutType,
  {
    label: string;
    Icon: React.FC<{ className?: string }>;
    containerClass: string;
    labelClass: string;
  }
> = {
  'Dica de Iniciante': {
    label: 'Dica de Iniciante',
    Icon: Compass,
    containerClass:
      'bg-[#e3f1f3]/70 dark:bg-[#17282d]/80 border-[#23666f]/35 dark:border-[#6cb8c7]/30',
    labelClass: 'text-[#1c5259] dark:text-[#6cb8c7]',
  },
  'Exploit e Otimizacao': {
    label: 'Exploit e Otimização',
    Icon: Sparkles,
    containerClass:
      'bg-[#fff4d6]/80 dark:bg-[#292214]/80 border-[#9a6e08]/35 dark:border-[#d4af37]/35',
    labelClass: 'text-[#875e04] dark:text-[#d4af37]',
  },
  'Alerta de Bug': {
    label: 'Alerta de Bug / Cuidado',
    Icon: AlertTriangle,
    containerClass:
      'bg-[#f7e4e2]/80 dark:bg-[#2d1719]/80 border-[#8c2323]/35 dark:border-[#e06c6c]/35',
    labelClass: 'text-[#7a1f1f] dark:text-[#e06c6c]',
  },
  'Regra de Ouro': {
    label: 'Regra de Ouro',
    Icon: BookOpen,
    containerClass:
      'bg-[#e2efe9]/80 dark:bg-[#152620]/80 border-[#1e4d3b]/35 dark:border-[#3a8b6c]/35',
    labelClass: 'text-[#1e4d3b] dark:text-[#5cc49b]',
  },
  'Teste antes da luta': {
    label: 'Teste Antes da Luta',
    Icon: ShieldAlert,
    containerClass:
      'bg-[#ece4f3]/80 dark:bg-[#231930]/80 border-[#4a2a6b]/35 dark:border-[#a57bd4]/35',
    labelClass: 'text-[#3b1e54] dark:text-[#c19be8]',
  },
};

export const CalloutBox: React.FC<CalloutBoxProps> = ({
  tipo,
  titulo,
  children,
  sourcePage,
}) => {
  const cfg = CALLOUT_CONFIG[tipo];
  const Icon = cfg.Icon;

  return (
    <aside
      role="note"
      className={`rounded-lg border p-4 transition-colors ${cfg.containerClass}`}
    >
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className={`flex items-center gap-2 text-sm font-semibold ${cfg.labelClass}`}>
          <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="font-display tracking-wide">{titulo ?? cfg.label}</span>
        </div>
        {sourcePage !== undefined && (
          <span className="text-xs font-mono-nums text-[var(--text-muted)]">
            PDF p. {sourcePage}
          </span>
        )}
      </div>
      <div className="text-sm text-[var(--text-primary)] leading-relaxed">{children}</div>
    </aside>
  );
};
