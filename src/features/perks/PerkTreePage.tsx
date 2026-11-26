import React, { useMemo, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, ChevronUp, Lock, RotateCcw } from 'lucide-react';
import { dossieMechanics, perks } from '../../lib/data';
import { canUnlockPerk } from '../../lib/mechanics';
import { useGrimoireStore } from '../../store/useGrimoireStore';
import { CalloutBox } from '../../components/CalloutBox';
import { VerificationSeal } from '../../components/VerificationSeal';
import type { Perk } from '../../types/grimoire';

const SCHOOL_GROUPS: Array<{
  title: string;
  subtitle: string;
  schools: Perk['escola'][];
}> = [
  {
    title: 'Conjuração (Prioridade Máxima)',
    subtitle: 'Pré-requisitos confirmados de Twin Souls: Conjuration 100 e Dark Souls OU Elemental Potency.',
    schools: ['Conjuration'],
  },
  {
    title: 'Ilusão (Suporte Furtivo)',
    subtitle: 'Quiet Casting torna todas as invocações e feitiços silenciosos.',
    schools: ['Illusion'],
  },
  {
    title: 'Furtividade (Sneak) e Archery',
    subtitle: 'Deadly Aim (3x dano com arco) + Muffled Movement sustentam o Bow of Shadows.',
    schools: ['Sneak', 'Archery'],
  },
  {
    title: 'Utilidade: Encantamento',
    subtitle: 'Enchanter 5/5 e Insightful Enchanter levam 4 peças × 25% até 100% de redução (custo ZERO de Conjuration).',
    schools: ['Enchanting'],
  },
];

export const PerkTreePage: React.FC = () => {
  const skills = useGrimoireStore((s) => s.skills);
  const setSkillLevel = useGrimoireStore((s) => s.setSkillLevel);
  const purchasedPerks = useGrimoireStore((s) => s.purchasedPerks);
  const setPerkRank = useGrimoireStore((s) => s.setPerkRank);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [showOrder, setShowOrder] = useState(false);

  const purchasedIds = useMemo(
    () => Object.entries(purchasedPerks).filter(([, r]) => r > 0).map(([id]) => id),
    [purchasedPerks]
  );

  const totalPointsSpent = useMemo(
    () => Object.values(purchasedPerks).reduce((sum, r) => sum + r, 0),
    [purchasedPerks]
  );

  const mandatoryPerks = perks.filter((p) => p.prioridade === 'obrigatorio');
  const mandatoryDone = mandatoryPerks.filter((p) => (purchasedPerks[p.id] ?? 0) > 0).length;

  const handleTogglePerk = (perk: Perk) => {
    const currentRank = purchasedPerks[perk.id] ?? 0;
    if (currentRank > 0) {
      // Cycle ranks or refund if already maxed
      if (currentRank < perk.ranks) {
        setPerkRank(perk.id, currentRank + 1);
        setFeedback(null);
      } else {
        // Check if another purchased perk strictly depends on this one
        const dependent = perks.find((other) => {
          if ((purchasedPerks[other.id] ?? 0) === 0) return false;
          if (other.prerequisitos.includes(perk.id)) return true;
          if (other.prerequisitos_ou.includes(perk.id)) {
            const otherSatisfied = other.prerequisitos_ou.some(
              (alt) => alt !== perk.id && (purchasedPerks[alt] ?? 0) > 0
            );
            return !otherSatisfied;
          }
          return false;
        });

        if (dependent) {
          setFeedback(
            `Não é possível remover "${perk.nome}" enquanto "${dependent.nome}" estiver ativo.`
          );
          return;
        }
        setPerkRank(perk.id, 0);
        setFeedback(null);
      }
      return;
    }

    const check = canUnlockPerk(perk, purchasedIds, skills);
    if (!check.allowed) {
      setFeedback(`${perk.nome}: ${check.reason}`);
      return;
    }

    setPerkRank(perk.id, 1);
    setFeedback(null);
  };

  const resetAllPerks = () => {
    for (const id of purchasedIds) {
      setPerkRank(id, 0);
    }
    setFeedback(null);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Árvore de Perks Interativa</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Baseada na Figura 3 (Cap. 2.6, PDF p. 9). Clique nos perks para marcar ou avançar ranks.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-[var(--text-muted)]">Pontos gastos</div>
              <div className="font-mono-nums text-xl font-bold text-[var(--accent-gold)]">
                {totalPointsSpent}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--text-muted)]">Obrigatórios</div>
              <div className="font-mono-nums text-xl font-bold text-[var(--accent-emerald)]">
                {mandatoryDone} / {mandatoryPerks.length}
              </div>
            </div>
            <button
              type="button"
              onClick={resetAllPerks}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[40px]"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Limpar</span>
            </button>
          </div>
        </div>

        {/* Skill Level Sliders for Prerequisite Validation */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-[var(--border-subtle)]">
          {(Object.keys(skills) as Array<keyof typeof skills>).map((sk) => (
            <label key={sk} className="block space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--text-secondary)]">{sk}</span>
                <span className="font-mono-nums text-[var(--accent-gold)] font-semibold">
                  {skills[sk]}
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={100}
                value={skills[sk]}
                onChange={(e) => setSkillLevel(sk, Number(e.target.value))}
                className="w-full accent-[var(--accent-gold)]"
              />
            </label>
          ))}
        </div>

        {feedback && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-[var(--accent-crimson)]/40 bg-[var(--accent-crimson)]/10 px-4 py-2.5 text-sm text-[var(--accent-crimson)]"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{feedback}</span>
          </div>
        )}
      </section>

      <CalloutBox tipo="Dica de Iniciante" titulo="Quiet Casting, Invisibilidade e Respec" sourcePage={9}>
        <strong>Quiet Casting</strong> torna todas as invocações e feitiços silenciosos. Combine com{' '}
        <em>Muffle</em> (passos mudos) e o <em>Bow of Shadows</em> (invisibilidade ao sacar). Caso queira
        redistribuir perks mais tarde, <strong>Black Book: Waking Dreams</strong> (Dragonborn) permite
        reembolsar uma árvore inteira gastando 1 alma de dragão{' '}
        <VerificationSeal confidenceTier="B" note="Respec em Waking Dreams citado via fonte secundária." />.
      </CalloutBox>

      {/* Recommended 30-Perk Order (~Level 31) */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-3">
        <button
          type="button"
          onClick={() => setShowOrder((v) => !v)}
          className="w-full flex items-center justify-between gap-2 text-left"
        >
          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
              Ordem Recomendada dos 30 Perks (~Nível 31 · Dossiê Sec. 2.4 + UESP)
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Sequência completa do 1º ao 30º ponto de perk (incluindo Adept Illusion no passo 22 antes de Expert Illusion).
            </p>
          </div>
          {showOrder ? (
            <ChevronUp className="w-5 h-5 text-[var(--accent-gold)] shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--accent-gold)] shrink-0" />
          )}
        </button>

        {showOrder && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t border-[var(--border-subtle)]">
            {dossieMechanics.perk_order_30.map((step) => {
              const currentRank = purchasedPerks[step.perk_id] ?? 0;
              const done = currentRank >= step.rank;
              return (
                <div
                  key={step.step}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${
                    done
                      ? 'border-[var(--accent-emerald)]/50 bg-[var(--accent-emerald)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span>
                    <strong className="font-mono-nums text-[var(--accent-gold)] mr-1.5">
                      #{step.step}
                    </strong>
                    {step.label}
                  </span>
                  {done && <Check className="w-3.5 h-3.5 text-[var(--accent-emerald)] shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* School Trees */}
      <div className="space-y-6">
        {SCHOOL_GROUPS.map((group) => {
          const groupPerks = perks.filter((p) => group.schools.includes(p.escola));
          return (
            <section
              key={group.title}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4"
            >
              <div>
                <h2 className="font-display text-lg font-semibold text-[var(--accent-gold)]">
                  {group.title}
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">{group.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {groupPerks.map((perk) => {
                  const rank = purchasedPerks[perk.id] ?? 0;
                  const unlocked = canUnlockPerk(perk, purchasedIds, skills);
                  const isMandatory = perk.prioridade === 'obrigatorio';

                  return (
                    <button
                      key={perk.id}
                      type="button"
                      onClick={() => handleTogglePerk(perk)}
                      className={`text-left rounded-lg border p-3.5 transition-all flex flex-col justify-between gap-2 min-h-[120px] ${
                        rank > 0
                          ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/15'
                          : unlocked.allowed
                          ? isMandatory
                            ? 'border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] hover:border-[var(--accent-gold)]/60'
                            : 'border-dashed border-[var(--border-subtle)] bg-transparent hover:border-[var(--accent-purple)]/60'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/35 opacity-65'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                          <span>
                            {isMandatory ? 'Obrigatório' : 'Opcional'} · {perk.fase_recomendada.toUpperCase()}
                          </span>
                          {rank > 0 ? (
                            <span className="font-mono-nums text-[var(--accent-gold)] font-semibold flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              {perk.ranks > 1 ? `${rank}/${perk.ranks}` : 'Ativo'}
                            </span>
                          ) : !unlocked.allowed ? (
                            <Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                          ) : null}
                        </div>
                        <div className="font-display text-sm font-semibold text-[var(--text-primary)]">
                          {perk.nome}
                        </div>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] leading-snug">
                        {perk.nota}
                      </p>

                      {perk.nivel_habilidade_minimo !== null && perk.nivel_habilidade_minimo > 0 && (
                        <div className="text-[11px] font-mono-nums text-[var(--accent-ice)]">
                          Req. {perk.escola} {perk.nivel_habilidade_minimo}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
