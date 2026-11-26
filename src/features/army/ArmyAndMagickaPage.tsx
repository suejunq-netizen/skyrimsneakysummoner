import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, CheckCircle2, ShieldAlert, Users } from 'lucide-react';
import { armyComposition } from '../../lib/data';
import { calculateMagickaCostReduction } from '../../lib/mechanics';
import { CalloutBox } from '../../components/CalloutBox';
import { VerificationSeal } from '../../components/VerificationSeal';

interface SummonOption {
  id: string;
  nome: string;
  isColossus?: boolean;
  isSkeleton?: boolean;
  note: string;
}

const SUMMON_OPTIONS: SummonOption[] = [
  {
    id: 'bone_colossus',
    nome: 'Conjure Bone Colossus (Master)',
    isColossus: true,
    note: '1 por vez. Enquanto ativo (60 s), libera +2 esqueletos adicionais.',
  },
  {
    id: 'skeleton_champion',
    nome: 'Conjure Skeleton Champion',
    isSkeleton: true,
    note: 'Esqueleto de combate corpo a corpo (Necromantic Grimoire).',
  },
  {
    id: 'skeleton_marksman',
    nome: 'Conjure Skeleton Marksman',
    isSkeleton: true,
    note: 'Esqueleto arqueiro à distância (Necromantic Grimoire).',
  },
  {
    id: 'skeleton_warlock',
    nome: 'Conjure Skeleton Warlock',
    isSkeleton: true,
    note: 'Esqueleto mago (Necromantic Grimoire).',
  },
  {
    id: 'ancient_deathpriest',
    nome: 'Conjure Ancient Deathpriest (Master)',
    note: 'Sacerdote da Morte ancestral (Phinis Gestor nível 46+).',
  },
  {
    id: 'pride_hirstaang',
    nome: 'Pride of Hirstaang (Urso)',
    note: 'Expert (Arcane Accessories): 287 Magicka, urso + resistência a frio.',
  },
  {
    id: 'undying_ghost',
    nome: 'Conjure Undying Ghost',
    note: 'Consome toda a Magicka atual; escala até 600 de atributos.',
  },
  {
    id: 'soul_cairn',
    nome: 'Conjure Wrathman / Mistman (Dawnguard)',
    note: 'Invocação exclusiva da Soul Cairn.',
  },
];

export const ArmyAndMagickaPage: React.FC = () => {
  // Army Simulator state
  const [hasTwinSouls, setHasTwinSouls] = useState(true);
  const [selectedSummons, setSelectedSummons] = useState<string[]>([
    'bone_colossus',
    'skeleton_champion',
    'skeleton_marksman',
    'ancient_deathpriest',
  ]);
  const [follower, setFollower] = useState<'none' | 'serana' | 'other'>('serana');
  const [hasAnimal, setHasAnimal] = useState(true);

  // Magicka Calculator state
  const [vokunEquipped, setVokunEquipped] = useState(true);
  const [necromancersAmuletEquipped, setNecromancersAmuletEquipped] = useState(true);
  const [chestPct, setChestPct] = useState(25);
  const [handsPct, setHandsPct] = useState(0);
  const [ringPct, setRingPct] = useState(25);
  const [neckCustomPct, setNeckCustomPct] = useState(25);
  const [hasTierCostPerk, setHasTierCostPerk] = useState(true);
  const [baseSpellCost, setBaseSpellCost] = useState(287);

  const toggleSummon = (id: string) => {
    setSelectedSummons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const armyAnalysis = useMemo(() => {
    const colossusActive = selectedSummons.includes('bone_colossus');
    const chosenSkeletons = selectedSummons.filter(
      (id) => SUMMON_OPTIONS.find((o) => o.id === id)?.isSkeleton
    );
    const chosenNonSkeletons = selectedSummons.filter(
      (id) => !SUMMON_OPTIONS.find((o) => o.id === id)?.isSkeleton
    );

    const baseLimit = hasTwinSouls ? 2 : 1;
    const bonusSkeletonSlots = colossusActive ? 2 : 0;
    const maxTheoreticalSummons = baseLimit + bonusSkeletonSlots;

    // Count non-skeleton slots first, then bonus skeleton slots, then remaining base slots
    const nonSkelUsed = chosenNonSkeletons.length;
    const overflowWarning =
      nonSkelUsed > baseLimit ||
      selectedSummons.length > maxTheoreticalSummons ||
      (!colossusActive && selectedSummons.length > baseLimit);

    const effectiveSummons = Math.min(selectedSummons.length, maxTheoreticalSummons);
    const followerCount = follower === 'none' ? 0 : 1;
    const animalCount = hasAnimal ? 1 : 0;

    return {
      baseLimit,
      bonusSkeletonSlots,
      maxTheoreticalSummons,
      effectiveSummons,
      followerCount,
      animalCount,
      totalAllies: effectiveSummons + followerCount + animalCount,
      overflowWarning,
      skeletonCount: chosenSkeletons.length,
    };
  }, [selectedSummons, hasTwinSouls, follower, hasAnimal]);

  const magickaCalc = useMemo(
    () =>
      calculateMagickaCostReduction({
        vokunEquipped,
        necromancersAmuletEquipped,
        chestReductionPct: chestPct,
        handsReductionPct: handsPct,
        ringReductionPct: ringPct,
        neckCustomReductionPct: neckCustomPct,
        hasTierCostPerk,
        baseSpellCost,
      }),
    [
      vokunEquipped,
      necromancersAmuletEquipped,
      chestPct,
      handsPct,
      ringPct,
      neckCustomPct,
      hasTierCostPerk,
      baseSpellCost,
    ]
  );

  const chartData = armyComposition.map((a) => ({
    fase: a.fase.toUpperCase(),
    Invocações: a.invocacoes_simultaneas,
    'Total Aliados': a.total_aliados,
    'Redução (%)': a.reducao_magicka_planejada_pct,
  }));

  return (
    <div className="space-y-8">
      {/* Army Simulator */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold">
              Simulador de Exército &amp; Calculadora de Magicka
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Monte sua formação de combate (Cap. 2.5 e Cap. 7.2) e otimize a redução até 100% (custo zero com 4 peças × 25%).
            </p>
          </div>
          <div className="font-mono-nums text-right">
            <span className="text-xs text-[var(--text-muted)] block">Total em campo (simulado)</span>
            <span className="text-2xl font-bold text-[var(--accent-gold)]">
              {armyAnalysis.totalAllies} aliados
            </span>
          </div>
        </div>

        <CalloutBox tipo="Teste antes da luta" sourcePage={8}>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <VerificationSeal
                needsVerification
                confidenceTier="A/C"
                note="Interação entre Bone Colossus, Twin Souls e Ascendant Necromancer Robes exige teste em casa."
              />
              <span className="text-xs text-[var(--text-muted)]">
                (PDF original contava 6 aliados sem teste controlado)
              </span>
            </div>
            <p>
              <strong>Risco confirmado na UESP [A]:</strong> com <em>Twin Souls</em> ativo, invocar um{' '}
              <strong>Bone Colossus</strong> após outras invocações pode fazer criaturas anteriores desaparecerem.
              Além disso, o bônus de <strong>Ascendant Necromancer Robes</strong> (+1 invocação menor){' '}
              <strong>[C]</strong> é de fonte secundária, e o <em>Ascendant Necromancer Hood</em> apenas dá +100
              Magicka (19h–5h) / -30% regen de HP (não invoca Deathpriest).{' '}
              <strong>Teste dentro de casa</strong> antes de depender da formação em masmorras.
            </p>
          </div>
        </CalloutBox>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTwinSouls}
                  onChange={(e) => setHasTwinSouls(e.target.checked)}
                  className="accent-[var(--accent-gold)]"
                />
                <span>Perk Twin Souls ativo (2 base)</span>
              </label>

              <select
                aria-label="Seguidor"
                value={follower}
                onChange={(e) => setFollower(e.target.value as 'none' | 'serana' | 'other')}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs text-[var(--text-primary)]"
              >
                <option value="serana">Seguidora: Serana (recomendada)</option>
                <option value="other">Outro seguidor humano</option>
                <option value="none">Sem seguidor</option>
              </select>

              <label className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAnimal}
                  onChange={(e) => setHasAnimal(e.target.checked)}
                  className="accent-[var(--accent-gold)]"
                />
                <span>Animal de companhia (cão)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUMMON_OPTIONS.map((opt) => {
                const active = selectedSummons.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleSummon(opt.id)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      active
                        ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/12'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/60 hover:border-[var(--accent-gold)]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-xs font-semibold text-[var(--text-primary)]">
                        {opt.nome}
                      </span>
                      <span className="text-[11px] font-semibold text-[var(--accent-gold)]">
                        {active ? 'Ativo' : '+'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{opt.note}</p>
                  </button>
                );
              })}
            </div>

            {armyAnalysis.overflowWarning && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-[var(--accent-crimson)]/45 bg-[var(--accent-crimson)]/10 p-3 text-xs text-[var(--accent-crimson)]"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Você selecionou mais invocações ({selectedSummons.length}) do que o limite teórico atual (
                  {armyAnalysis.maxTheoreticalSummons}: base {armyAnalysis.baseLimit} + bônus de Colosso{' '}
                  {armyAnalysis.bonusSkeletonSlots}). Uma nova invocação substituirá uma antiga.
                </span>
              </div>
            )}
          </div>

          {/* Summary & Figure 2 Chart */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4 space-y-2">
              <div className="flex items-center gap-2 font-display text-sm font-semibold text-[var(--accent-gold)]">
                <Users className="w-4 h-4" aria-hidden="true" />
                <span>Composição Atual</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div>
                  <div className="font-mono-nums text-lg font-bold">{armyAnalysis.effectiveSummons}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Invocações</div>
                </div>
                <div>
                  <div className="font-mono-nums text-lg font-bold">{armyAnalysis.followerCount}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Seguidor</div>
                </div>
                <div>
                  <div className="font-mono-nums text-lg font-bold">{armyAnalysis.animalCount}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Animal</div>
                </div>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] pt-1">
                Seguidores e animais não consomem espaço de invocação.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4">
              <h3 className="font-display text-xs font-semibold text-[var(--text-secondary)] mb-3">
                Aliados em Campo por Fase (Figura 2 · PDF p. 8)
              </h3>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(184,134,11,0.18)" />
                    <XAxis dataKey="fase" tick={{ fontSize: 11, fill: '#9aa5b1' }} />
                    <YAxis domain={[0, 8]} tick={{ fontSize: 11, fill: '#9aa5b1' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#181c24',
                        borderColor: 'rgba(212,175,55,0.35)',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Invocações" fill="#1e4d3b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Total Aliados" fill="#d4af37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Magicka Cost Reduction Calculator */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold">
              Calculadora de Custo de Magicka (Custo Zero · 100%)
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              UESP: 4 peças com 25% de redução (Cabeça, Peito, Anel e Amuleto) chegam a <strong>100% (custo ZERO)</strong>. O teto de 85% vale apenas para resistências, não para custo de feitiços.
            </p>
          </div>
          <span className="text-xs font-mono-nums text-[var(--text-muted)]">Dossiê Sec. 2.6 · PDF p. 8, 16, 22</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3 cursor-pointer">
                <span className="text-sm">Máscara Vokun (-20%)</span>
                <input
                  type="checkbox"
                  checked={vokunEquipped}
                  onChange={(e) => setVokunEquipped(e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent-gold)]"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3 cursor-pointer">
                <span className="text-sm">Necromancer&apos;s Amulet (-25%)</span>
                <input
                  type="checkbox"
                  checked={necromancersAmuletEquipped}
                  onChange={(e) => setNecromancersAmuletEquipped(e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent-gold)]"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-3 cursor-pointer sm:col-span-2">
                <span className="text-sm">Perk da categoria do feitiço ativo (corta custo pela metade)</span>
                <input
                  type="checkbox"
                  checked={hasTierCostPerk}
                  onChange={(e) => setHasTierCostPerk(e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent-gold)]"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Peito (Fortify Conjuration)</span>
                  <span className="font-mono-nums text-[var(--accent-gold)]">{chestPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={35}
                  value={chestPct}
                  onChange={(e) => setChestPct(Number(e.target.value))}
                  className="w-full accent-[var(--accent-gold)]"
                />
              </label>

              <label className="block space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Slot extra / alternativo (ex.: anel secundário ou ajuste manual)</span>
                  <span className="font-mono-nums text-[var(--accent-gold)]">{handsPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={35}
                  value={handsPct}
                  onChange={(e) => setHandsPct(Number(e.target.value))}
                  className="w-full accent-[var(--accent-gold)]"
                />
              </label>

              <label className="block space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Anel encantado</span>
                  <span className="font-mono-nums text-[var(--accent-gold)]">{ringPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={35}
                  value={ringPct}
                  onChange={(e) => setRingPct(Number(e.target.value))}
                  className="w-full accent-[var(--accent-gold)]"
                />
              </label>

              {!necromancersAmuletEquipped && (
                <label className="block space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Amuleto próprio (alternativo)</span>
                    <span className="font-mono-nums text-[var(--accent-gold)]">{neckCustomPct}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={35}
                    value={neckCustomPct}
                    onChange={(e) => setNeckCustomPct(Number(e.target.value))}
                    className="w-full accent-[var(--accent-gold)]"
                  />
                </label>
              )}

              <label className="block space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Custo base do feitiço (ex.: Pride of Hirstaang = 287)</span>
                  <span className="font-mono-nums text-[var(--accent-ice)]">{baseSpellCost}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={500}
                  step={5}
                  value={baseSpellCost}
                  onChange={(e) => setBaseSpellCost(Number(e.target.value))}
                  className="w-full accent-[var(--accent-ice)]"
                />
              </label>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[var(--text-muted)]">Soma bruta das peças</span>
                <span className="font-mono-nums text-base font-semibold">
                  {magickaCalc.rawGearReductionPct}%
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[var(--text-muted)]">Redução efetiva (máx. 100% · custo zero)</span>
                <span className="font-mono-nums text-2xl font-bold text-[var(--accent-gold)]">
                  {magickaCalc.effectiveGearReductionPct}%
                </span>
              </div>
              <div className="flex justify-between items-baseline border-t border-[var(--border-subtle)] pt-2">
                <span className="text-xs text-[var(--text-muted)]">
                  Custo estimado após perk + peças (aprox.)
                </span>
                <span className="font-mono-nums text-xl font-bold text-[var(--accent-ice)]">
                  {magickaCalc.finalEstimatedCost} Magicka
                </span>
              </div>

              {magickaCalc.exceedsCap ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-[var(--accent-crimson)]/40 bg-[var(--accent-crimson)]/10 p-3 text-xs text-[var(--accent-crimson)]"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Excesso de <strong>{magickaCalc.wastedPct}%</strong> acima de 100% (custo zero)!
                    Você já zerou Conjuration e pode redirecionar esse slot para{' '}
                    <strong>Fortify Illusion</strong>, <strong>Fortify Sneak</strong> ou{' '}
                    <strong>Fortify Magicka</strong>.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[var(--accent-emerald)]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    {magickaCalc.effectiveGearReductionPct === 100
                      ? 'Custo ZERO de Conjuration alcançado (100% sem desperdício).'
                      : 'Dentro do limite de 100% sem desperdício de slots (4 peças × 25% zeram o custo).'}
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4">
              <h3 className="font-display text-xs font-semibold text-[var(--text-secondary)] mb-2">
                Curva Planejada de Redução (Figura 2 · PDF p. 8)
              </h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(184,134,11,0.18)" />
                    <XAxis dataKey="fase" tick={{ fontSize: 11, fill: '#9aa5b1' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9aa5b1' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#181c24',
                        borderColor: 'rgba(212,175,55,0.35)',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Redução (%)"
                      stroke="#a57bd4"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
