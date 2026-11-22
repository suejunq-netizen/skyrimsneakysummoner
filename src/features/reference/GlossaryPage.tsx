import React, { useMemo, useState } from 'react';
import { BookMarked, Search } from 'lucide-react';
import { glossary } from '../../lib/data';

type OriginFilter = 'all' | 'Cap. 1' | 'Apêndice B';

export const GlossaryPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [originFilter, setOriginFilter] = useState<OriginFilter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return glossary.filter((entry) => {
      if (originFilter !== 'all' && entry.origem !== originFilter) return false;
      if (!q) return true;
      return (
        entry.termo_en.toLowerCase().includes(q) ||
        entry.termo_pt.toLowerCase().includes(q) ||
        entry.significado.toLowerCase().includes(q)
      );
    });
  }, [query, originFilter]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-[var(--accent-gold)]" aria-hidden="true" />
              <span>Glossário PT ↔ EN (Cap. 1 e Apêndice B)</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Termos essenciais de Skyrim em inglês com equivalência e explicação clara para iniciantes em português.
            </p>
          </div>
          <span className="font-mono-nums text-xs text-[var(--text-muted)]">
            {filtered.length} de {glossary.length} termos
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar por termo em inglês, português ou significado..."
              aria-label="Filtrar termos do glossário"
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] min-h-[42px]"
            />
          </div>

          <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] w-fit">
            {(
              [
                ['all', 'Todos'],
                ['Cap. 1', 'Cap. 1 (Sobrevivência)'],
                ['Apêndice B', 'Apêndice B'],
              ] as const
            ).map(([val, lbl]) => (
              <button
                key={val}
                type="button"
                onClick={() => setOriginFilter(val)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap min-h-[36px] ${
                  originFilter === val
                    ? 'bg-[var(--accent-gold)] text-[#11141a]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-muted)]">
          Nenhum termo encontrado para &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entry) => (
            <article
              key={entry.id}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-baseline justify-between gap-2 text-xs text-[var(--text-muted)]">
                  <span>{entry.origem}</span>
                  <span className="font-mono-nums">PDF p. {entry.source_page}</span>
                </div>
                <h2 className="font-display text-lg font-semibold text-[var(--accent-gold)] mt-1">
                  {entry.termo_en}
                </h2>
                <div className="text-xs font-medium text-[var(--text-primary)]">
                  Em português: {entry.termo_pt}
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                  {entry.significado}
                </p>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
                {entry.game_version_note}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
