import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  MapPin,
  Save,
  User,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { combatAndLoops, guidedSteps, phases, quests } from '../../lib/data';
import { useGrimoireStore } from '../../store/useGrimoireStore';
import { CalloutBox } from '../../components/CalloutBox';
import { SaveReminderModal } from '../../components/SaveReminderModal';
import { VerificationSeal } from '../../components/VerificationSeal';
import type { PhaseId } from '../../types/grimoire';

export const GuidedRoutePage: React.FC = () => {
  const activePhase = useGrimoireStore((s) => s.activePhase);
  const setActivePhase = useGrimoireStore((s) => s.setActivePhase);
  const completedGuidedSteps = useGrimoireStore((s) => s.completedGuidedSteps);
  const toggleGuidedStep = useGrimoireStore((s) => s.toggleGuidedStep);
  const completedPhaseChecklists = useGrimoireStore((s) => s.completedPhaseChecklists);
  const togglePhaseChecklist = useGrimoireStore((s) => s.togglePhaseChecklist);
  const completedFinalChecklistIds = useGrimoireStore((s) => s.completedFinalChecklistIds);
  const toggleFinalChecklist = useGrimoireStore((s) => s.toggleFinalChecklist);

  const [searchParams] = useSearchParams();
  const linkedStep = guidedSteps.find((step) => step.id === searchParams.get('passo'));
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [saveModalStep, setSaveModalStep] = useState<{ title: string; warnings: string[] } | null>(
    null
  );
  const [tab, setTab] = useState<'proximo' | 'checklists' | 'problemas'>('proximo');

  useEffect(() => {
    if (!linkedStep) return;
    setActivePhase(linkedStep.fase);
    setSelectedStepId(linkedStep.id);
    setTab('proximo');
  }, [linkedStep, setActivePhase]);

  const phaseSteps = guidedSteps.filter((st) => st.fase === activePhase);
  const currentPhaseObj = phases.find((p) => p.id === activePhase) ?? phases[0];

  const activeStep =
    guidedSteps.find((s) => s.id === selectedStepId) ??
    phaseSteps.find((s) => !completedGuidedSteps.includes(s.id)) ??
    phaseSteps[0] ??
    guidedSteps[0];

  const currentIdx = guidedSteps.findIndex((s) => s.id === activeStep.id);
  const isCompleted = completedGuidedSteps.includes(activeStep.id);

  const handlePhaseChange = (id: PhaseId) => {
    setActivePhase(id);
    setSelectedStepId(null);
  };

  const openSaveModalForStep = () => {
    const linkedQuest = quests.find((q) => q.id === activeStep.quest_id);
    const warnings = linkedQuest?.bugs_conhecidos ?? [
      activeStep.callout_texto ?? 'Salve manualmente em um slot separado antes de avançar.',
    ];
    setSaveModalStep({ title: activeStep.titulo, warnings });
  };

  return (
    <div className="space-y-6">
      {/* Phase Progress Header */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              Rota Guiada Passo a Passo
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Progresso total: <span className="font-mono-nums font-semibold text-[var(--accent-gold)]">{completedGuidedSteps.length} / {guidedSteps.length}</span> etapas concluídas
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]">
            {(
              [
                ['proximo', 'Próximo Passo'],
                ['checklists', 'Checklists & Apêndice C'],
                ['problemas', 'Solução de Problemas'],
              ] as const
            ).map(([k, lbl]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] ${
                  tab === k
                    ? 'bg-[var(--accent-gold)] text-[#11141a]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Phase Selector Bars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {phases.map((p) => {
            const stepsInPhase = guidedSteps.filter((s) => s.fase === p.id);
            const doneInPhase = stepsInPhase.filter((s) =>
              completedGuidedSteps.includes(s.id)
            ).length;
            const pct =
              stepsInPhase.length > 0 ? Math.round((doneInPhase / stepsInPhase.length) * 100) : 0;
            const isSelected = activePhase === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePhaseChange(p.id)}
                className={`text-left rounded-lg border p-3 transition-colors min-h-[76px] ${
                  isSelected
                    ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/60 hover:border-[var(--accent-gold)]/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-semibold text-[var(--text-primary)]">
                    {p.nome}
                  </span>
                  <span className="font-mono-nums text-xs text-[var(--accent-gold)]">{pct}%</span>
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{p.faixa_de_nivel}</div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-black/25 overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-gold)] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Chapter Transition Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhaseObj.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-4"
        >
          <div className="text-xs font-mono-nums uppercase tracking-widest text-[var(--accent-gold)]">
            Capítulo · {currentPhaseObj.nome} ({currentPhaseObj.faixa_de_nivel})
          </div>
          <p className="mt-1 text-sm sm:text-base text-[var(--text-secondary)] italic">
            {currentPhaseObj.narrativa_abertura}
          </p>
        </motion.div>
      </AnimatePresence>

      {tab === 'proximo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Focus Card (Single Action at a Time) */}
          <div className="lg:col-span-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono-nums text-[var(--accent-gold)]">
                  Passo {activeStep.ordem} de {guidedSteps.length} · PDF p. {activeStep.source_page}
                </span>
                <VerificationSeal
                  needsVerification={activeStep.needs_verification}
                  confidenceTier={activeStep.confidence_tier}
                  note={activeStep.game_version_note}
                />
              </div>
              {activeStep.salvar_antes && (
                <button
                  type="button"
                  onClick={openSaveModalForStep}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent-crimson)]/50 bg-[var(--accent-crimson)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent-crimson)] hover:bg-[var(--accent-crimson)]/20 min-h-[36px]"
                >
                  <Save className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Salvar antes</span>
                </button>
              )}
            </div>

            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              {activeStep.titulo}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-ice)]">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <span>Onde ir</span>
                </div>
                <p className="mt-1 text-[var(--text-primary)]">{activeStep.onde_ir}</p>
                {activeStep.location_id && (
                  <Link
                    to={`/mapa?local=${activeStep.location_id}`}
                    className="inline-block mt-1.5 text-xs text-[var(--accent-gold)] hover:underline"
                  >
                    Ver no mapa →
                  </Link>
                )}
              </div>

              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-gold)]">
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span>Com quem falar</span>
                </div>
                <p className="mt-1 text-[var(--text-primary)]">
                  {activeStep.com_quem_falar ?? 'Nenhum NPC específico obrigatório'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                O que fazer
              </h3>
              <ol className="space-y-2 list-decimal pl-5 text-base text-[var(--text-primary)]">
                {activeStep.o_que_fazer.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ol>
            </div>

            {activeStep.o_que_lootear.length > 0 && (
              <div>
                <h3 className="font-display text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  O que obter / lootear
                </h3>
                <ul className="space-y-1 list-disc pl-5 text-sm text-[var(--text-secondary)]">
                  {activeStep.o_que_lootear.map((loot, idx) => (
                    <li key={idx}>{loot}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeStep.callout_tipo && activeStep.callout_texto && (
              <CalloutBox tipo={activeStep.callout_tipo} sourcePage={activeStep.source_page}>
                {activeStep.callout_texto}
              </CalloutBox>
            )}

            {/* Primary Step Actions */}
            <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentIdx <= 0}
                  onClick={() => {
                    const prev = guidedSteps[currentIdx - 1];
                    if (prev) {
                      setActivePhase(prev.fase);
                      setSelectedStepId(prev.id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
                <button
                  type="button"
                  disabled={currentIdx >= guidedSteps.length - 1}
                  onClick={() => {
                    const nxt = guidedSteps[currentIdx + 1];
                    if (nxt) {
                      setActivePhase(nxt.fase);
                      setSelectedStepId(nxt.id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 min-h-[44px]"
                >
                  <span>Próximo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isCompleted && activeStep.salvar_antes) {
                    openSaveModalForStep();
                  }
                  toggleGuidedStep(activeStep.id);
                  if (!isCompleted && currentIdx < guidedSteps.length - 1) {
                    const nxt = guidedSteps[currentIdx + 1];
                    if (nxt) {
                      setActivePhase(nxt.fase);
                      setSelectedStepId(nxt.id);
                    }
                  }
                }}
                className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors min-h-[44px] ${
                  isCompleted
                    ? 'border border-[var(--accent-emerald)] text-[var(--accent-emerald)] bg-[var(--accent-emerald)]/10'
                    : 'bg-[var(--accent-gold)] text-[#11141a] hover:opacity-90'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>{isCompleted ? 'Passo concluído (desmarcar)' : 'Concluir passo'}</span>
              </button>
            </div>
          </div>

          {/* Step List in Active Phase */}
          <aside className="lg:col-span-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3">
            <h3 className="font-display text-sm font-semibold text-[var(--accent-gold)]">
              Passos em {currentPhaseObj.nome}
            </h3>
            <div className="space-y-1.5">
              {phaseSteps.map((step) => {
                const done = completedGuidedSteps.includes(step.id);
                const selected = step.id === activeStep.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setSelectedStepId(step.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-colors flex items-start gap-2.5 min-h-[44px] ${
                      selected
                        ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--text-primary)]'
                        : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface-muted)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2
                        className="w-4 h-4 text-[var(--accent-emerald)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle
                        className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    )}
                    <span className={done ? 'line-through opacity-75' : ''}>{step.titulo}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {tab === 'checklists' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
            <h2 className="font-display text-lg font-semibold text-[var(--accent-gold)]">
              Ponto de Verificação — {currentPhaseObj.nome}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {currentPhaseObj.ponto_de_verificacao}
            </p>
            <div className="space-y-2">
              {currentPhaseObj.checklist.map((item) => {
                const checked = completedPhaseChecklists.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] p-3 cursor-pointer hover:bg-[var(--bg-surface-muted)] min-h-[44px]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePhaseChecklist(item.id)}
                      className="mt-1 h-4 w-4 accent-[var(--accent-gold)]"
                    />
                    <span className={`text-sm ${checked ? 'line-through text-[var(--text-muted)]' : ''}`}>
                      {item.texto}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-semibold text-[var(--accent-gold)]">
                Checklist Final da Jornada (Apêndice C)
              </h2>
              <span className="text-xs font-mono-nums text-[var(--text-muted)]">PDF p. 27</span>
            </div>
            <div className="space-y-2">
              {combatAndLoops.final_checklist.map((item) => {
                const checked = completedFinalChecklistIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] p-2.5 cursor-pointer hover:bg-[var(--bg-surface-muted)] min-h-[44px]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFinalChecklist(item.id)}
                      className="mt-1 h-4 w-4 accent-[var(--accent-gold)]"
                    />
                    <span className={`text-sm ${checked ? 'line-through text-[var(--text-muted)]' : ''}`}>
                      <strong className="font-mono-nums text-[var(--accent-gold)] mr-1.5">
                        {item.ordem}.
                      </strong>
                      {item.texto}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'problemas' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-semibold">
                Problemas Comuns e Soluções (Cap. 8.2)
              </h2>
              <span className="text-xs text-[var(--text-muted)]">PDF p. 24</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                    <th className="py-2 pr-4">Problema</th>
                    <th className="py-2 pr-4">Causa provável</th>
                    <th className="py-2">Solução</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {combatAndLoops.troubleshooting.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-4 font-semibold text-[var(--text-primary)]">
                        {row.problema}
                      </td>
                      <td className="py-3 pr-4 text-[var(--text-secondary)]">
                        {row.causa_provavel}
                      </td>
                      <td className="py-3 text-[var(--text-primary)]">{row.solucao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-3">
            <h2 className="font-display text-lg font-semibold text-[var(--accent-crimson)]">
              Erros Comuns de Iniciantes (Cap. 8.3)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {combatAndLoops.beginner_mistakes.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3.5"
                >
                  <div className="font-semibold text-sm text-[var(--text-primary)]">{m.erro}</div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{m.motivo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <SaveReminderModal
        open={!!saveModalStep}
        questTitle={saveModalStep?.title ?? ''}
        warnings={saveModalStep?.warnings ?? []}
        onClose={() => setSaveModalStep(null)}
      />
    </div>
  );
};
