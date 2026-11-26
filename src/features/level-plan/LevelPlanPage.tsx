import React from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Gem, ScrollText, Shield, Sparkles } from 'lucide-react';
import { GameIcon } from '../../components/art/GameIcons';
import { NordicBanner } from '../../components/art/NordicBanner';
import { RuneRing } from '../../components/art/RuneRing';
import { VerificationSeal } from '../../components/VerificationSeal';
import { levelPlan } from '../../lib/data';
import { useGrimoireStore } from '../../store/useGrimoireStore';
import type { LevelEvent, PhaseId } from '../../types/grimoire';

const MAX_LEVEL = 46;
const SKILLS = ['Conjuration', 'Illusion', 'Sneak', 'Archery', 'Enchanting'] as const;

const TAGS: Record<LevelEvent['tag'], { label: string; Icon: React.ElementType; cls: string }> = {
  Q: { label: 'Quest', Icon: ScrollText, cls: 'text-[var(--accent-ice)]' },
  L: { label: 'Loot e compra', Icon: Gem, cls: 'text-[var(--accent-emerald)]' },
  G: { label: 'Equipamento', Icon: Shield, cls: 'text-[var(--accent-purple)]' },
  T: { label: 'Treino', Icon: Sparkles, cls: 'text-[var(--text-secondary)]' },
  W: { label: 'Atenção', Icon: AlertCircle, cls: 'text-[var(--accent-gold)]' },
};

export function phaseForLevel(level: number): { id: PhaseId; label: string } {
  if (level <= 10) return { id: 'early', label: 'Early Game (níveis 1–10)' };
  if (level <= 25) return { id: 'mid', label: 'Mid Game (níveis 11–25)' };
  if (level <= 45) return { id: 'late', label: 'Late Game (níveis 26–45)' };
  return { id: 'end', label: 'End-Game (nível 46+)' };
}

export const LevelPlanPage: React.FC = () => {
  const storedLevel = useGrimoireStore((s) => s.characterLevel);
  const setCharacterLevel = useGrimoireStore((s) => s.setCharacterLevel);
  const doneTasks = useGrimoireStore((s) => s.completedLevelTasks);
  const toggleLevelTask = useGrimoireStore((s) => s.toggleLevelTask);

  const level = Math.min(MAX_LEVEL, Math.max(1, storedLevel));
  const entry = levelPlan.levels[level - 1];
  const prev = levelPlan.levels[Math.max(0, level - 2)];
  const phase = phaseForLevel(level);
  const nextGate = levelPlan.gates.find((g) => g.nivel > level);
  const gateLevels = levelPlan.gates.map((g) => g.nivel);
  const goTo = (n: number) => setCharacterLevel(Math.min(MAX_LEVEL, Math.max(1, n)));
  const grindSkillUps = Math.ceil(entry.xp_proximo_nivel / 40);

  return (
    <div className="space-y-8">
      <section
        className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] text-[#ece7dc]"
        aria-label="Seu nível atual"
      >
        <NordicBanner phase={phase.id} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" aria-hidden="true" />
        <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr] items-center">
          <div className="mx-auto">
            <RuneRing level={level} max={MAX_LEVEL} gateLevels={gateLevels} />
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Nível a Nível</h1>
            <p className="text-sm text-[#c4beaf]">{phase.label}</p>
            <p className="text-lg">
              {level >= MAX_LEVEL
                ? 'Build e exército completos. Revise e teste tudo em casa.'
                : `Para ir ao nível ${level + 1} você precisa de ${entry.xp_proximo_nivel} XP de personagem.`}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goTo(level - 1)}
                aria-label="Nível anterior"
                className="min-h-[44px] min-w-[44px] rounded-lg border border-white/30 bg-black/30 hover:border-[var(--accent-gold)]"
              >
                <ChevronLeft className="mx-auto w-5 h-5" aria-hidden="true" />
              </button>
              <input
                type="range"
                min={1}
                max={MAX_LEVEL}
                value={level}
                onChange={(e) => goTo(Number(e.target.value))}
                aria-label="Seu nível atual no jogo"
                className="flex-1 accent-[var(--accent-ice)]"
              />
              <button
                type="button"
                onClick={() => goTo(level + 1)}
                aria-label="Próximo nível"
                className="min-h-[44px] min-w-[44px] rounded-lg border border-white/30 bg-black/30 hover:border-[var(--accent-gold)]"
              >
                <ChevronRight className="mx-auto w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-[#c4beaf]">
              Marque o nível em que você está no jogo. O progresso fica salvo e entra no backup JSON.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
            <h2 className="font-display text-lg font-semibold text-[var(--accent-gold)] mb-2">Faça neste nível</h2>
            <ul className="divide-y divide-[var(--border-subtle)]">
              {entry.eventos.map((ev, i) => {
                const id = `${level}-${i}`;
                const done = doneTasks.includes(id);
                const tag = TAGS[ev.tag];
                return (
                  <li key={id} className="flex gap-3 py-3">
                    <input
                      type="checkbox"
                      id={`lvl-task-${id}`}
                      checked={done}
                      onChange={() => toggleLevelTask(id)}
                      className="mt-1.5 h-5 w-5 shrink-0 accent-[var(--accent-ice)]"
                    />
                    <label htmlFor={`lvl-task-${id}`} className="flex-1 cursor-pointer">
                      <span className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`inline-flex items-center gap-1 font-semibold ${tag.cls}`}>
                          {ev.icon ? (
                            <GameIcon name={ev.icon} className="w-4 h-4" />
                          ) : (
                            <tag.Icon className="w-4 h-4" aria-hidden="true" />
                          )}
                          {tag.label}
                        </span>
                        <VerificationSeal needsVerification={ev.needs_verification} confidenceTier={ev.confidence_tier} />
                      </span>
                      <span className={`block mt-0.5 ${done ? 'line-through opacity-55' : ''}`}>{ev.texto}</span>
                    </label>
                  </li>
                );
              })}
              {level >= 31 && (
                <li className="flex gap-3 py-3">
                  <Sparkles className="mt-1 w-5 h-5 shrink-0 text-[var(--text-secondary)]" aria-hidden="true" />
                  <span>
                    <strong>Grind controlado.</strong> Faltam {entry.xp_proximo_nivel} XP de personagem, cerca de{' '}
                    {grindSkillUps} subidas de habilidade secundária (nível ~40, 40 XP cada) por uso normal:
                    Restoration, Smithing, Light Armor, Speech. Valor aproximado, sem loops infinitos.
                  </span>
                </li>
              )}
              {entry.eventos.length === 0 && level < 31 && (
                <li className="py-3 text-[var(--text-secondary)]">
                  Sem marco novo: treine as metas de habilidade e só então suba de nível.
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
            <h2 className="font-display text-lg font-semibold text-[var(--accent-gold)] mb-2">Perks deste nível</h2>
            {entry.perks_comprados.length > 0 ? (
              <ul className="space-y-1">
                {entry.perks_comprados.map((p) => (
                  <li key={p} className="font-semibold">
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[var(--text-secondary)]">
                {level === 1 ? 'Você começa sem perks.' : 'Nenhum perk liberado neste nível.'}
              </p>
            )}
            {entry.perks_guardados > 0 && (
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {entry.perks_guardados} ponto(s) guardado(s)
                {level > 31
                  ? ': perks extras como Overdraw, Eagle Eye e Silent Roll.'
                  : ' até a habilidade atingir o requisito do próximo perk.'}
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
            <h2 className="font-display text-lg font-semibold text-[var(--accent-gold)] mb-2">Habilidades-meta</h2>
            <div className="space-y-2">
              {SKILLS.map((name) => {
                const value = entry.skills[name];
                const delta = level > 1 ? value - prev.skills[name] : 0;
                return (
                  <div key={name} className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-2 text-sm">
                    <span>{name}</span>
                    <div className="h-2 rounded bg-[var(--bg-surface-muted)]" aria-hidden="true">
                      <div className="h-2 rounded bg-[var(--accent-ice)]" style={{ width: `${value}%` }} />
                    </div>
                    <span className="font-mono-nums text-right">
                      {value}
                      {delta > 0 && <span className="ml-1 text-[var(--accent-emerald)]">+{delta}</span>}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              Metas aproximadas (baseline Breton, só habilidades da build), interpoladas entre os marcos do dossiê.
            </p>
          </section>

          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
            <h2 className="font-display text-lg font-semibold text-[var(--accent-gold)] mb-2">Travas à frente</h2>
            <ul className="divide-y divide-[var(--border-subtle)]">
              {levelPlan.gates.map((g) => {
                const remaining = g.nivel - level;
                const isNext = nextGate?.nivel === g.nivel;
                return (
                  <li
                    key={g.nivel}
                    className={`flex items-center justify-between gap-3 py-2 ${
                      remaining <= 0 ? 'text-[var(--accent-emerald)]' : isNext ? 'text-[var(--accent-gold)]' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {g.texto}
                      <VerificationSeal confidenceTier={g.confidence_tier} />
                    </span>
                    <strong className="font-mono-nums whitespace-nowrap">
                      {remaining <= 0 ? 'liberado' : `nível ${g.nivel} (faltam ${remaining})`}
                    </strong>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              {nextGate
                ? `Próxima trava: faltam ${nextGate.nivel - level} nível(is) para ${nextGate.texto}.`
                : 'Todas as travas foram liberadas.'}
            </p>
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <h2 className="font-display text-lg font-semibold text-[var(--accent-gold)] mb-3">Rota completa, nível a nível</h2>
        <div className="grid grid-cols-8 sm:grid-cols-12 lg:grid-cols-[repeat(23,minmax(0,1fr))] gap-1.5" role="group" aria-label="Escolher nível">
          {levelPlan.levels.map((l) => {
            const isGate = gateLevels.includes(l.nivel);
            const current = l.nivel === level;
            return (
              <button
                key={l.nivel}
                type="button"
                onClick={() => goTo(l.nivel)}
                aria-label={`Nível ${l.nivel}${isGate ? ' (libera algo)' : ''}`}
                aria-current={current ? 'step' : undefined}
                className={`relative min-h-[36px] rounded-md border text-xs font-mono-nums ${
                  current
                    ? 'bg-[var(--accent-ice)] text-[#11141a] border-[var(--accent-ice)]'
                    : l.nivel < level
                      ? 'opacity-55 border-[var(--border-subtle)]'
                      : 'border-[var(--border-subtle)] hover:border-[var(--accent-gold)]'
                }`}
              >
                {l.nivel}
                {isGate && (
                  <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Ponto dourado: nível em que algo é liberado. Arte original em SVG, sem assets do jogo.
        </p>
      </section>
    </div>
  );
};
