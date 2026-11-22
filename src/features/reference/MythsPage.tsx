import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, Scale, ShieldAlert } from 'lucide-react';
import { mythsVsFacts } from '../../lib/data';
import { CalloutBox } from '../../components/CalloutBox';
import { VerificationSeal } from '../../components/VerificationSeal';
import type { MythVsFact } from '../../types/grimoire';

type CategoryFilter = 'all' | MythVsFact['categoria'];

const CATEGORY_META: Record<
  MythVsFact['categoria'],
  { label: string; colorClass: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  confirmado: {
    label: 'Confirmado',
    colorClass: 'text-[var(--accent-emerald)]',
    Icon: CheckCircle2,
  },
  confirmado_parcial: {
    label: 'Confirmado em parte',
    colorClass: 'text-[var(--accent-gold)]',
    Icon: Scale,
  },
  corrigido: {
    label: 'Mito corrigido',
    colorClass: 'text-[var(--accent-crimson)]',
    Icon: ShieldAlert,
  },
  omitido: {
    label: 'Omitido / Verificar in-game',
    colorClass: 'text-[var(--accent-ice)]',
    Icon: AlertCircle,
  },
};

export const MythsPage: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const counts = useMemo(() => {
    const map: Record<MythVsFact['categoria'], number> = {
      confirmado: 0,
      confirmado_parcial: 0,
      corrigido: 0,
      omitido: 0,
    };
    for (const m of mythsVsFacts) {
      map[m.categoria] += 1;
    }
    return map;
  }, []);

  const filtered = useMemo(
    () =>
      categoryFilter === 'all'
        ? mythsVsFacts
        : mythsVsFacts.filter((m) => m.categoria === categoryFilter),
    [categoryFilter]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[var(--accent-gold)]" aria-hidden="true" />
              <span>Mitos vs. Fatos (Apêndice A)</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Verificações do guia para evitar armadilhas comuns, rumores imprecisos e expectativas erradas em Skyrim Anniversary Edition.
            </p>
          </div>
          <span className="font-mono-nums text-xs text-[var(--text-muted)]">
            {mythsVsFacts.length} registros · PDF p. 25
          </span>
        </div>

        {/* Category filter bar */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] w-fit max-w-full">
          {(
            [
              ['all', `Todos (${mythsVsFacts.length})`],
              ['corrigido', `Corrigidos (${counts.corrigido})`],
              ['confirmado_parcial', `Parciais (${counts.confirmado_parcial})`],
              ['confirmado', `Confirmados (${counts.confirmado})`],
              ['omitido', `Omitidos (${counts.omitido})`],
            ] as const
          ).map(([val, lbl]) => (
            <button
              key={val}
              type="button"
              onClick={() => setCategoryFilter(val)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap min-h-[36px] transition-colors ${
                categoryFilter === val
                  ? 'bg-[var(--accent-gold)] text-[#11141a]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </section>

      <CalloutBox tipo="Alerta de Bug" titulo="Rigor do Apêndice A" sourcePage={25}>
        O guia omite deliberadamente rumores e detalhes que não foram 100% confirmados na edição oficial (como o suposto baú invisível de Dawnstar ou poderes exatos de cada Black Book), preservando apenas o que foi conferido. Itens marcados com <strong>Verificar in-game</strong> permanecem sinalizados neste companion.
      </CalloutBox>

      {/* Myth vs Fact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((entry) => {
          const meta = CATEGORY_META[entry.categoria];
          const Icon = meta.Icon;
          return (
            <article
              key={entry.id}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1.5 font-semibold ${meta.colorClass}`}>
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{meta.label}</span>
                  </span>
                  <span className="font-mono-nums text-[var(--text-muted)]">
                    PDF p. {entry.source_page} · Nível: {entry.confidence_tier ? `[${entry.confidence_tier}]` : entry.confidence}
                  </span>
                </div>

                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/60 p-3">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
                    Alegação comum / Item
                  </div>
                  <h2 className="font-display text-base font-semibold text-[var(--text-primary)] mt-0.5">
                    {entry.alegacao_comum}
                  </h2>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--accent-gold)]">
                    O que foi conferido
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {entry.o_que_foi_conferido}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                <span>{entry.game_version_note}</span>
                <VerificationSeal
                  needsVerification={entry.needs_verification}
                  confidenceTier={entry.confidence_tier}
                  note={entry.game_version_note}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
