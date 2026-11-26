import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Lock, PlayCircle, Save, ScrollText } from 'lucide-react';
import { quests } from '../../lib/data';
import { computeQuestStatus } from '../../lib/mechanics';
import { useGrimoireStore } from '../../store/useGrimoireStore';
import { SaveReminderModal } from '../../components/SaveReminderModal';
import { VerificationSeal } from '../../components/VerificationSeal';
import type { PhaseId, Quest, QuestState } from '../../types/grimoire';

const STATE_LABELS: Record<QuestState, { label: string; colorClass: string }> = {
  bloqueada: { label: 'Bloqueada', colorClass: 'text-[var(--text-muted)]' },
  disponivel: { label: 'Disponível', colorClass: 'text-[var(--accent-ice)]' },
  em_andamento: { label: 'Em andamento', colorClass: 'text-[var(--accent-gold)]' },
  concluida: { label: 'Concluída', colorClass: 'text-[var(--accent-emerald)]' },
};

export const QuestTrackerPage: React.FC = () => {
  const characterLevel = useGrimoireStore((s) => s.characterLevel);
  const completedQuests = useGrimoireStore((s) => s.completedQuests);
  const questStepProgress = useGrimoireStore((s) => s.questStepProgress);
  const toggleQuestCompleted = useGrimoireStore((s) => s.toggleQuestCompleted);
  const toggleQuestStep = useGrimoireStore((s) => s.toggleQuestStep);

  const [phaseFilter, setPhaseFilter] = useState<'all' | PhaseId>('all');
  const [dlcFilter, setDlcFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [savePromptQuest, setSavePromptQuest] = useState<Quest | null>(null);

  const regions = useMemo(
    () => Array.from(new Set(quests.map((q) => q.regiao))).sort(),
    []
  );

  const filteredQuests = useMemo(
    () =>
      quests.filter((q) => {
        if (phaseFilter !== 'all' && q.fase !== phaseFilter) return false;
        if (dlcFilter !== 'all' && q.dlc !== dlcFilter) return false;
        if (regionFilter !== 'all' && q.regiao !== regionFilter) return false;
        return true;
      }),
    [phaseFilter, dlcFilter, regionFilter]
  );

  const handleStepToggle = (q: Quest, idx: number) => {
    const existing = questStepProgress[q.id] ?? [];
    if (q.salvar_antes && existing.length === 0 && !completedQuests.includes(q.id)) {
      setSavePromptQuest(q);
    }
    toggleQuestStep(q.id, idx);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold">Diário de Quests</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Acompanhe dependências, passos, alertas de bug e lembretes de salvamento manual.
            </p>
          </div>
          <span className="font-mono-nums text-sm text-[var(--accent-gold)]">
            {completedQuests.length} / {quests.length} concluídas
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]">
            {(
              [
                ['all', 'Todas'],
                ['early', 'Early'],
                ['mid', 'Mid'],
                ['late', 'Late'],
              ] as const
            ).map(([val, lbl]) => (
              <button
                key={val}
                type="button"
                onClick={() => setPhaseFilter(val)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium min-h-[36px] ${
                  phaseFilter === val
                    ? 'bg-[var(--accent-gold)] text-[#11141a]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <select
            aria-label="Filtrar por DLC"
            value={dlcFilter}
            onChange={(e) => setDlcFilter(e.target.value)}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs text-[var(--text-primary)] min-h-[40px]"
          >
            <option value="all">Todas as edições / DLCs</option>
            <option value="Vanilla">Vanilla</option>
            <option value="Creation Club">Creation Club</option>
            <option value="Dawnguard">Dawnguard</option>
            <option value="Dragonborn">Dragonborn</option>
          </select>

          <select
            aria-label="Filtrar por região"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs text-[var(--text-primary)] min-h-[40px]"
          >
            <option value="all">Todas as regiões</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Quest List */}
      <div className="space-y-4">
        {filteredQuests.map((q) => {
          const state = computeQuestStatus(q, completedQuests, questStepProgress);
          const stateMeta = STATE_LABELS[state];
          const checkedSteps = questStepProgress[q.id] ?? [];

          return (
            <article
              key={q.id}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className={`font-semibold ${stateMeta.colorClass}`}>
                      {state === 'bloqueada' && <Lock className="w-3.5 h-3.5 inline mr-1" />}
                      {state === 'disponivel' && <ScrollText className="w-3.5 h-3.5 inline mr-1" />}
                      {state === 'em_andamento' && <PlayCircle className="w-3.5 h-3.5 inline mr-1" />}
                      {state === 'concluida' && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />}
                      {stateMeta.label}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{q.fase.toUpperCase()}</span>
                    <span aria-hidden="true">·</span>
                    <span>{q.dlc}</span>
                    <span aria-hidden="true">·</span>
                    <span>{q.regiao}</span>
                    <span aria-hidden="true">·</span>
                    <span>Nv. {q.nivel_recomendado}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-nums">PDF p. {q.source_page}</span>
                    <VerificationSeal
                      needsVerification={q.needs_verification}
                      confidenceTier={q.confidence_tier}
                      note={q.game_version_note}
                    />
                  </div>

                  <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
                    {q.nome_en}{' '}
                    <span className="text-base font-normal text-[var(--text-secondary)]">
                      ({q.nome_pt})
                    </span>
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Onde iniciar: <strong className="text-[var(--text-primary)]">{q.onde_iniciar}</strong> · NPC:{' '}
                    <strong className="text-[var(--text-primary)]">{q.npc}</strong>
                  </p>
                  {q.nivel_minimo_zona && (
                    <div
                      className={`inline-block rounded-md border px-2.5 py-1 text-xs font-medium mt-1 ${
                        characterLevel >= q.nivel_minimo_zona
                          ? 'border-[var(--accent-emerald)]/45 bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)]'
                          : 'border-[var(--accent-crimson)]/45 bg-[var(--accent-crimson)]/10 text-[var(--accent-crimson)]'
                      }`}
                    >
                      {characterLevel >= q.nivel_minimo_zona
                        ? `Entrar agora (zona mín. Nv. ${q.nivel_minimo_zona})`
                        : `Deixar para depois (mín. Nv. ${q.nivel_minimo_zona} · seu Nv. ${characterLevel})`}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {q.salvar_antes && (
                    <button
                      type="button"
                      onClick={() => setSavePromptQuest(q)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent-crimson)]/50 bg-[var(--accent-crimson)]/10 px-3 py-2 text-xs font-semibold text-[var(--accent-crimson)] min-h-[40px]"
                    >
                      <Save className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Salvar antes</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (q.salvar_antes && !completedQuests.includes(q.id)) {
                        setSavePromptQuest(q);
                      }
                      toggleQuestCompleted(q.id);
                    }}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors min-h-[40px] ${
                      state === 'concluida'
                        ? 'border border-[var(--accent-emerald)] text-[var(--accent-emerald)] bg-[var(--accent-emerald)]/10'
                        : 'bg-[var(--accent-gold)] text-[#11141a] hover:opacity-90'
                    }`}
                  >
                    {state === 'concluida' ? 'Concluída' : 'Marcar concluída'}
                  </button>
                </div>
              </div>

              {q.dependencias.length > 0 && (
                <div className="text-xs text-[var(--text-muted)]">
                  Dependências:{' '}
                  {q.dependencias
                    .map((dep) => quests.find((item) => item.id === dep)?.nome_en ?? dep)
                    .join(', ')}
                </div>
              )}

              {/* Step Checkboxes */}
              <div className="space-y-1.5">
                {q.passos.map((passo, idx) => {
                  const isStepDone = checkedSteps.includes(idx) || state === 'concluida';
                  return (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/50 px-3 py-2 cursor-pointer hover:bg-[var(--bg-surface-muted)] min-h-[40px]"
                    >
                      <input
                        type="checkbox"
                        checked={isStepDone}
                        onChange={() => handleStepToggle(q, idx)}
                        className="mt-1 h-4 w-4 accent-[var(--accent-gold)]"
                      />
                      <span
                        className={`text-sm ${
                          isStepDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {passo}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Rewards & Bugs */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2 border-t border-[var(--border-subtle)] text-xs">
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-[var(--accent-emerald)]">Recompensas: </span>
                    <span className="text-[var(--text-secondary)]">{q.recompensas.join(' · ')}</span>
                  </div>
                  {q.reward_gold_by_level && (
                    <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-2.5 py-1.5">
                      <span className="font-semibold text-[var(--accent-gold)] mr-2">
                        Ouro por nível (UESP):
                      </span>
                      <span className="font-mono-nums text-[var(--text-secondary)]">
                        {Object.entries(q.reward_gold_by_level)
                          .map(([lvlRange, gold]) => `Nv. ${lvlRange}: ${gold}g`)
                          .join(' · ')}
                      </span>
                    </div>
                  )}
                </div>
                {q.bugs_conhecidos.length > 0 && (
                  <div className="flex items-start gap-1.5 text-[var(--accent-crimson)]">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{q.bugs_conhecidos.join(' ')}</span>
                  </div>
                )}
              </div>

              {(q.needs_verification || q.confidence_tier === 'C' || q.confidence_tier === 'A/C') && (
                <p className="text-[11px] text-[var(--text-muted)]">
                  Nota de verificação: {q.game_version_note}
                </p>
              )}
            </article>
          );
        })}
      </div>

      <SaveReminderModal
        open={!!savePromptQuest}
        questTitle={savePromptQuest ? `${savePromptQuest.nome_en} (${savePromptQuest.nome_pt})` : ''}
        warnings={savePromptQuest?.bugs_conhecidos ?? []}
        onClose={() => setSavePromptQuest(null)}
      />
    </div>
  );
};
