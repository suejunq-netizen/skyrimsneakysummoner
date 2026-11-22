import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Gauge, GraduationCap, Info, RotateCcw } from 'lucide-react';
import { combatAndLoops, dossieMechanics } from '../../lib/data';
import { evaluateLevelBudget } from '../../lib/mechanics';
import { useGrimoireStore } from '../../store/useGrimoireStore';
import { CalloutBox } from '../../components/CalloutBox';
import { VerificationSeal } from '../../components/VerificationSeal';

export const LevelBudgetPage: React.FC = () => {
  const selectedRace = useGrimoireStore((s) => s.selectedRace);
  const characterLevel = useGrimoireStore((s) => s.characterLevel);
  const setCharacterLevel = useGrimoireStore((s) => s.setCharacterLevel);
  const skills = useGrimoireStore((s) => s.skills);
  const setSkillLevel = useGrimoireStore((s) => s.setSkillLevel);
  const purchasedPerks = useGrimoireStore((s) => s.purchasedPerks);

  const [plannedLoop, setPlannedLoop] = useState<'none' | 'moderate' | 'heavy'>('moderate');

  // Interactive "Wait 1h" loop timer
  const [waitRemainingSec, setWaitRemainingSec] = useState(0);
  const [waitSessions, setWaitSessions] = useState(0);

  useEffect(() => {
    if (waitRemainingSec <= 0) return;
    const t = setInterval(() => {
      setWaitRemainingSec((prev) => {
        if (prev <= 1) {
          setWaitSessions((c) => c + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [waitRemainingSec]);

  const perksSpent = useMemo(
    () => Object.values(purchasedPerks).reduce((a, b) => a + b, 0),
    [purchasedPerks]
  );

  const assessment = useMemo(
    () =>
      evaluateLevelBudget({
        race: selectedRace,
        characterLevel,
        conjuration: skills.Conjuration,
        illusion: skills.Illusion,
        sneak: skills.Sneak,
        archery: skills.Archery,
        enchanting: skills.Enchanting,
        perksSpent,
        plannedLoopIntensity: plannedLoop,
      }),
    [selectedRace, characterLevel, skills, perksSpent, plannedLoop]
  );

  return (
    <div className="space-y-8">
      {/* Level Budget Engine */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold">
              Orçamento de Nível &amp; Guia de Loops (Cap. 4)
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Inimigos escalam com seu nível (<em>level scaling</em>). Mantenha o nível do personagem controlado e
              as habilidades da build altas.
            </p>
          </div>
          <span className="text-xs font-mono-nums text-[var(--accent-gold)]">
            {assessment.phaseLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inputs */}
          <div className="lg:col-span-6 space-y-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4">
            <label className="block space-y-1.5">
              <div className="flex justify-between text-sm font-medium">
                <span>Nível atual do personagem</span>
                <span className="font-mono-nums text-[var(--accent-gold)] font-bold">
                  Nível {characterLevel}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={70}
                value={characterLevel}
                onChange={(e) => setCharacterLevel(Number(e.target.value))}
                className="w-full accent-[var(--accent-gold)]"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(skills) as Array<keyof typeof skills>).map((sk) => (
                <label key={sk} className="block space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{sk}</span>
                    <span className="font-mono-nums text-[var(--accent-ice)]">{skills[sk]}</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={100}
                    value={skills[sk]}
                    onChange={(e) => setSkillLevel(sk, Number(e.target.value))}
                    className="w-full accent-[var(--accent-ice)]"
                  />
                </label>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <div className="text-xs font-medium text-[var(--text-secondary)]">
                Intensidade planejada de loop (projeção aproximada):
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                {(
                  [
                    ['none', 'Sem loop'],
                    ['moderate', 'Moderado (~+3)'],
                    ['heavy', 'Intenso (~+6)'],
                  ] as const
                ).map(([val, lbl]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPlannedLoop(val)}
                    className={`py-1.5 px-2 rounded text-xs font-medium ${
                      plannedLoop === val
                        ? 'bg-[var(--accent-gold)] text-[#11141a]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Fórmulas UESP (Dossiê Sec. 2.1): XP p/ próximo nível ={' '}
                <span className="font-mono-nums">(N+3)×25</span> · XP acumulado ={' '}
                <span className="font-mono-nums">12,5×N² + 62,5×N − 75</span>. O delta de loop abaixo permanece{' '}
                <strong>aproximado</strong>. Perks comprados na árvore:{' '}
                <span className="font-mono-nums">{perksSpent}</span>.
              </p>
            </div>
          </div>

          {/* Assessment Outputs */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4">
              <div>
                <div className="text-[11px] text-[var(--text-muted)]">Nível só c/ 5 skills ({selectedRace})</div>
                <div className="font-mono-nums text-xl font-bold text-[var(--accent-emerald)]">
                  Nv. {assessment.buildOnlyLevel}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--text-muted)]">XP acumulado (build)</div>
                <div className="font-mono-nums text-lg font-semibold text-[var(--text-primary)]">
                  {assessment.buildOnlyXp}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--text-muted)]">XP p/ próximo nível</div>
                <div className="font-mono-nums text-lg font-semibold text-[var(--accent-ice)]">
                  {assessment.xpIntoCurrentLevel} / {assessment.xpToNextLevel}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--text-muted)]">Perks até Nv. {assessment.buildOnlyLevel}</div>
                <div className="font-mono-nums text-lg font-semibold text-[var(--accent-gold)]">
                  {assessment.availablePerkPoints} pts
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-[var(--text-muted)]">Nível projetado (aproximado)</div>
                <div className="font-mono-nums text-2xl font-bold text-[var(--text-primary)]">
                  Nv. {assessment.approximateProjectedLevel}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--text-muted)]">Teto da fase atual</div>
                <div className="font-mono-nums text-lg font-semibold text-[var(--accent-gold)]">
                  {assessment.phaseLevelCeiling ?? '46+ (livre)'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {assessment.alerts.map((al, idx) => (
                <div
                  key={idx}
                  role={al.severity === 'warning' ? 'alert' : 'status'}
                  className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs leading-relaxed ${
                    al.severity === 'warning'
                      ? 'border-[var(--accent-crimson)]/45 bg-[var(--accent-crimson)]/10 text-[var(--accent-crimson)]'
                      : al.severity === 'success'
                      ? 'border-[var(--accent-emerald)]/45 bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)]'
                      : 'border-[var(--accent-ice)]/45 bg-[var(--accent-ice)]/10 text-[var(--accent-ice)]'
                  }`}
                >
                  {al.severity === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                  {al.severity === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                  {al.severity === 'info' && <Info className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span>{al.message}</span>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4 space-y-2">
              <h2 className="font-display text-sm font-semibold flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>Metas de Habilidade</span>
              </h2>
              <div className="space-y-2 text-xs">
                {assessment.skillTargets.map((st) => (
                  <div
                    key={st.skill}
                    className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-1.5 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <span className="font-semibold text-[var(--text-primary)]">{st.skill}</span>
                      <span className="text-[var(--text-muted)] block">{st.targetNote}</span>
                    </div>
                    <span className="font-mono-nums font-bold text-[var(--accent-gold)]">
                      {st.current}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Evolution Loops Guide + Wait 1h Timer */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold">
              Loops Seguros de Evolução (Cap. 4.1–4.3)
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Exclui exploits de economia infinita, seguindo exatamente a recomendação do guia.
            </p>
          </div>

          {/* Interactive Wait 1h Helper */}
          <div className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2">
            <Clock className="w-4 h-4 text-[var(--accent-ice)]" aria-hidden="true" />
            <div className="text-xs">
              <div className="font-mono-nums font-semibold">
                {waitRemainingSec > 0
                  ? `Wait 1h: ${waitRemainingSec}s`
                  : `Ciclos concluídos: ${waitSessions}`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWaitRemainingSec(waitRemainingSec > 0 ? 0 : 5)}
              className="rounded-md bg-[var(--accent-gold)] px-3 py-1.5 text-xs font-semibold text-[#11141a] min-h-[34px]"
            >
              {waitRemainingSec > 0 ? 'Cancelar' : 'Simular Wait 1h'}
            </button>
            {waitSessions > 0 && (
              <button
                type="button"
                onClick={() => setWaitSessions(0)}
                aria-label="Zerar contador de Wait"
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <CalloutBox tipo="Alerta de Bug" titulo="Cuidado com os 'loops infinitos'" sourcePage={16}>
          Existem combinações de poções e encantamentos que quebram a economia e o equilíbrio do jogo.
          Este guia <strong>não depende delas</strong>: você será forte o bastante com Conjuration,
          Illusion e Enchanting normais.
        </CalloutBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {combatAndLoops.loops.map((lp) => (
            <article
              key={lp.id}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4 space-y-3"
            >
              <div>
                <div className="text-xs text-[var(--accent-gold)] font-mono-nums">
                  {lp.escola} · PDF p. {lp.source_page}
                </div>
                <h3 className="font-display text-base font-bold mt-0.5">{lp.nome}</h3>
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-xs text-[var(--text-primary)]">
                {lp.passos.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ol>
              <p className="text-xs text-[var(--accent-ice)]">{lp.dica}</p>
              <p className="text-xs text-[var(--accent-crimson)]">{lp.aviso_nivel}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Breton Milestones & Intentional Post-31 Leveling (Dossiê Sec. 2.2 - 2.4) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold">
              Marcos da Build (Baseline Breton · Dossiê Sec. 2.2)
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Fechando apenas as 5 habilidades da build, os 30 perks cabem exatamente até o nível ~31 (30 pontos de perk).
              Pós-31: suba habilidades secundárias de propósito para Nv. 32 (Elite), Nv. 40 (Ascendant) e Nv. 46 (Phinis Master).
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                  <th className="py-2 pr-3">Marco</th>
                  <th className="py-2 pr-2">Conj</th>
                  <th className="py-2 pr-2">Ill</th>
                  <th className="py-2 pr-2">Sneak</th>
                  <th className="py-2 pr-2">Arch</th>
                  <th className="py-2 pr-2">Ench</th>
                  <th className="py-2">Nível aprox.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-mono-nums">
                {dossieMechanics.build_milestones_breton.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2 pr-3 font-sans font-semibold text-[var(--text-primary)]">{m.label}</td>
                    <td className="py-2 pr-2">{m.conj}</td>
                    <td className="py-2 pr-2">{m.ill}</td>
                    <td className="py-2 pr-2">{m.sneak}</td>
                    <td className="py-2 pr-2">{m.arch}</td>
                    <td className="py-2 pr-2">{m.ench}</td>
                    <td className="py-2 font-bold text-[var(--accent-gold)]">~{m.approx_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3 text-xs text-[var(--text-secondary)] space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-[var(--text-primary)]">Gates de Nível (Creation Club):</strong>
              <VerificationSeal
                confidenceTier={dossieMechanics.cc_level_gates.phinis_stock.confidence_tier}
                note="Níveis mínimos do estoque de Phinis Gestor possuem variação parcial em fontes comunitárias."
              />
            </div>
            <div>
              <strong>Phinis Gestor (Grimoire):</strong> Apprentice Nv. {dossieMechanics.cc_level_gates.phinis_stock.apprentice} · Novice Nv. {dossieMechanics.cc_level_gates.phinis_stock.novice} · Adept Nv. {dossieMechanics.cc_level_gates.phinis_stock.adept} · Expert Nv. {dossieMechanics.cc_level_gates.phinis_stock.expert} · Master Nv. {dossieMechanics.cc_level_gates.phinis_stock.master}
            </div>
            <div>
              <strong>Necromancer Robes [A]:</strong> Basic Nv. {dossieMechanics.cc_level_gates.necromancer_robes.basic} · Quickening Nv. {dossieMechanics.cc_level_gates.necromancer_robes.quickening} · Recharging Nv. {dossieMechanics.cc_level_gates.necromancer_robes.recharging} · Replenishing Nv. {dossieMechanics.cc_level_gates.necromancer_robes.replenishing} · Elite Nv. {dossieMechanics.cc_level_gates.necromancer_robes.elite} · Ascendant Nv. {dossieMechanics.cc_level_gates.necromancer_robes.ascendant}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[var(--accent-gold)]" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold">
              Treinadores Úteis (Dossiê Sec. 2.5)
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Limite da UESP: máx. <strong>{dossieMechanics.level_math.training.max_per_level} treinos por nível</strong>{' '}
            (Comum até {dossieMechanics.level_math.training.caps.common} · Expert até{' '}
            {dossieMechanics.level_math.training.caps.expert} · Master até{' '}
            {dossieMechanics.level_math.training.caps.master}).
          </p>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {dossieMechanics.trainers.map((tr) => (
              <div
                key={tr.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {tr.npc}{' '}
                    <span className="text-[var(--accent-ice)] font-normal">({tr.escola})</span>
                  </div>
                  <div className="text-[var(--text-muted)]">{tr.local}</div>
                </div>
                <span className="font-mono-nums font-semibold text-[var(--accent-gold)] whitespace-nowrap">
                  {tr.tier}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
