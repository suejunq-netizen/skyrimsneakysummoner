import React, { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { spells } from '../../lib/data';
import { useGrimoireStore } from '../../store/useGrimoireStore';
import { CalloutBox } from '../../components/CalloutBox';
import { VerificationSeal } from '../../components/VerificationSeal';

export const SpellbookPage: React.FC = () => {
  const characterLevel = useGrimoireStore((s) => s.characterLevel);
  const collectedLootIds = useGrimoireStore((s) => s.collectedLootIds);
  const toggleLootCollected = useGrimoireStore((s) => s.toggleLootCollected);

  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [maxCost, setMaxCost] = useState<number>(350);
  const [onlyMissing, setOnlyMissing] = useState(false);

  const filteredSpells = useMemo(() => {
    return spells.filter((sp) => {
      if (schoolFilter !== 'all' && sp.escola !== schoolFilter) return false;
      if (packageFilter !== 'all' && sp.pacote !== packageFilter) return false;
      if (typeof sp.custo_magicka === 'number' && sp.custo_magicka > maxCost) return false;
      if (onlyMissing && collectedLootIds.includes(sp.id)) return false;
      return true;
    });
  }, [schoolFilter, packageFilter, maxCost, onlyMissing, collectedLootIds]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold">Grimório de Feitiços</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Catálogo completo dos feitiços do guia (Cap. 3, 5, 6 e 7) com regras de estoque por nível.
            </p>
          </div>
          <span className="font-mono-nums text-xs text-[var(--accent-gold)]">
            {spells.filter((s) => collectedLootIds.includes(s.id)).length} / {spells.length} aprendidos
          </span>
        </div>

        <CalloutBox tipo="Dica de Iniciante" titulo="Estoque de Phinis Gestor &amp; Criação (AE)" sourcePage={18}>
          <div className="space-y-1.5">
            <p>
              <strong>Necromantic Grimoire (13 feitiços):</strong> além de drops aleatórios em{' '}
              <em>Warlock Lairs</em>, aparecem à venda com <strong>Phinis Gestor</strong> (Colégio de Winterhold) conforme o nível do personagem:{' '}
              <span className="font-mono-nums">Apprentice Nv. 1 · Novice Nv. 10 · Adept Nv. 20 · Expert Nv. 35 · Master Nv. 46</span>{' '}
              <VerificationSeal confidenceTier="A/C" note="Gates por nível de Phinis Gestor; Master 46+ confirmado em fontes da comunidade." />{' '}
              (seu nível atual: <span className="font-mono-nums font-semibold">{characterLevel}</span>).{' '}
              <strong>Não exigem</strong> a quest <em>Conjuration Ritual Spell</em>.
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              <strong>Arcane Accessories:</strong> tomos extras também estão no baú de <em>Hob&apos;s Fall Cave</em> (entre Winterhold e Dawnstar) e ligados à quest <em>The Lost Library</em>.
            </p>
          </div>
        </CalloutBox>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 items-center pt-1">
          <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]">
            {(['all', 'Conjuration', 'Illusion', 'Destruction', 'Restoration'] as const).map(
              (sch) => (
                <button
                  key={sch}
                  type="button"
                  onClick={() => setSchoolFilter(sch)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium min-h-[36px] ${
                    schoolFilter === sch
                      ? 'bg-[var(--accent-gold)] text-[#11141a]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {sch === 'all' ? 'Todas Escolas' : sch}
                </button>
              )
            )}
          </div>

          <select
            aria-label="Filtrar por pacote"
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs text-[var(--text-primary)] min-h-[40px]"
          >
            <option value="all">Todos os Pacotes</option>
            <option value="Necromantic Grimoire">Necromantic Grimoire</option>
            <option value="Arcane Accessories">Arcane Accessories</option>
            <option value="Dawnguard">Dawnguard</option>
            <option value="vanilla">Vanilla</option>
            <option value="Arcane Archer Pack">Arcane Archer Pack (Opcional)</option>
          </select>

          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span>Custo máx. conhecido:</span>
            <input
              type="range"
              min={50}
              max={350}
              step={10}
              value={maxCost}
              onChange={(e) => setMaxCost(Number(e.target.value))}
              className="accent-[var(--accent-gold)]"
            />
            <span className="font-mono-nums w-10">{maxCost}</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(e) => setOnlyMissing(e.target.checked)}
              className="accent-[var(--accent-gold)]"
            />
            <span>Apenas faltantes</span>
          </label>
        </div>
      </section>

      {/* Spells Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSpells.map((sp) => {
          const learned = collectedLootIds.includes(sp.id);
          const lockedByLevel =
            sp.estoque_minimo_nivel !== null && characterLevel < sp.estoque_minimo_nivel;

          return (
            <article
              key={sp.id}
              className={`rounded-xl border p-5 space-y-3 transition-colors ${
                learned
                  ? 'border-[var(--accent-emerald)]/50 bg-[var(--bg-surface)]'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {sp.escola} · {sp.nivel_de_habilidade} · {sp.pacote} · PDF p. {sp.source_page}
                  </div>
                  <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mt-0.5 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[var(--accent-purple)] shrink-0" aria-hidden="true" />
                    <span>{sp.nome}</span>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => toggleLootCollected(sp.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold min-h-[38px] shrink-0 ${
                    learned
                      ? 'border border-[var(--accent-emerald)] text-[var(--accent-emerald)] bg-[var(--accent-emerald)]/10'
                      : 'border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]/50'
                  }`}
                >
                  {learned ? 'Aprendido' : 'Marcar'}
                </button>
              </div>

              <p className="text-sm text-[var(--text-secondary)]">{sp.efeito}</p>

              <div className="grid grid-cols-2 gap-2 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3">
                <div>
                  <span className="text-[var(--text-muted)]">Custo Magicka: </span>
                  <span className="font-mono-nums font-medium text-[var(--accent-ice)]">
                    {sp.custo_magicka}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Duração: </span>
                  <span className="font-mono-nums font-medium text-[var(--text-primary)]">
                    {sp.duracao_s === null ? 'Instantâneo / contínuo' : `${sp.duracao_s} s`}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[var(--text-muted)]">Onde obter: </span>
                  <span className="text-[var(--text-primary)]">{sp.onde_obter.join(' · ')}</span>
                </div>
              </div>

              {lockedByLevel && (
                <div className="text-xs text-[var(--accent-gold)] font-medium">
                  Estoque garantido na loja de Phinis Gestor somente a partir do nível{' '}
                  <span className="font-mono-nums">{sp.estoque_minimo_nivel}+</span>.
                </div>
              )}

              {(sp.needs_verification || sp.confidence_tier === 'C' || sp.confidence_tier === 'A/C' || sp.confidence_tier === 'B') && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  <VerificationSeal
                    needsVerification={sp.needs_verification}
                    confidenceTier={sp.confidence_tier}
                    note={sp.game_version_note}
                  />
                  <span>{sp.game_version_note}</span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
