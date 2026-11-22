import type { Perk, PhaseId, Quest, QuestState } from '../types/grimoire';

export interface MagickaCalcInput {
  vokunEquipped: boolean;
  necromancersAmuletEquipped: boolean;
  chestReductionPct: number;
  handsReductionPct: number;
  ringReductionPct: number;
  neckCustomReductionPct: number;
  hasTierCostPerk: boolean; // Novice-Master perks halve cost independently before/after gear
  baseSpellCost: number;
}

export interface MagickaCalcResult {
  rawGearReductionPct: number;
  effectiveGearReductionPct: number;
  wastedPct: number;
  perkMultiplier: number;
  finalEstimatedCost: number;
  exceedsCap: boolean;
}

/**
 * Computes Conjuration Magicka cost reduction based on UESP / Dossiê Sec. 2.6:
 * 4 pieces x 25% = 100% (ZERO Magicka cost). The 85% cap applies ONLY to resistances,
 * NOT to spell cost reduction.
 * Tier perks (Novice to Master) halve cost independently.
 */
export function calculateMagickaCostReduction(input: MagickaCalcInput): MagickaCalcResult {
  const vokun = input.vokunEquipped ? 20 : 0;
  const amulet = input.necromancersAmuletEquipped
    ? 25
    : Math.max(0, Math.min(100, input.neckCustomReductionPct));

  const gearSum =
    vokun +
    amulet +
    Math.max(0, Math.min(100, input.chestReductionPct)) +
    Math.max(0, Math.min(100, input.handsReductionPct)) +
    Math.max(0, Math.min(100, input.ringReductionPct));

  const CAP = 100;
  const effectiveGearReductionPct = Math.min(CAP, gearSum);
  const wastedPct = Math.max(0, gearSum - CAP);
  const perkMultiplier = input.hasTierCostPerk ? 0.5 : 1;
  const afterPerk = input.baseSpellCost * perkMultiplier;
  const finalEstimatedCost = Math.max(
    0,
    Math.round(afterPerk * (1 - effectiveGearReductionPct / 100))
  );

  return {
    rawGearReductionPct: gearSum,
    effectiveGearReductionPct,
    wastedPct,
    perkMultiplier,
    finalEstimatedCost,
    exceedsCap: gearSum > CAP,
  };
}

export type BuildRaceId = 'breton' | 'altmer' | 'dunmer';

export interface BuildSkillLevels {
  Conjuration: number;
  Illusion: number;
  Sneak: number;
  Archery: number;
  Enchanting: number;
}

/** UESP exact XP to advance from level N to N + 1: (N + 3) * 25 */
export function xpToNextLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return (safeLevel + 3) * 25;
}

/** UESP exact cumulative character XP required to reach level N: 12.5*N^2 + 62.5*N - 75 */
export function cumulativeXpForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  if (safeLevel <= 1) return 0;
  return 12.5 * safeLevel * safeLevel + 62.5 * safeLevel - 75;
}

/** Inverse of cumulativeXpForLevel: exact character level unlocked by total XP */
export function levelFromCumulativeXp(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return Math.max(1, Math.floor((-62.5 + Math.sqrt(62.5 * 62.5 + 50 * (75 + totalXp))) / 25));
}

export function getRaceBaseBuildSkills(race: BuildRaceId): BuildSkillLevels {
  switch (race) {
    case 'breton':
      return { Conjuration: 25, Illusion: 20, Sneak: 15, Archery: 15, Enchanting: 15 };
    case 'altmer':
      return { Conjuration: 15, Illusion: 25, Sneak: 15, Archery: 15, Enchanting: 15 };
    case 'dunmer':
    default:
      return { Conjuration: 15, Illusion: 15, Sneak: 15, Archery: 15, Enchanting: 15 };
  }
}

export interface BuildProgressionMetrics {
  buildOnlyXp: number;
  buildOnlyLevel: number;
  xpForNextLevel: number;
  xpIntoCurrentLevel: number;
  availablePerkPoints: number;
}

/**
 * Exact UESP character XP & level gained exclusively from the 5 build skills.
 * Each skill up from S-1 to S grants S character XP.
 */
export function calculateBuildProgressionFromSkills(
  race: BuildRaceId,
  skills: BuildSkillLevels
): BuildProgressionMetrics {
  const base = getRaceBaseBuildSkills(race);
  let buildOnlyXp = 0;

  (Object.keys(base) as Array<keyof BuildSkillLevels>).forEach((k) => {
    const start = base[k];
    const current = Math.max(start, Math.min(100, Math.floor(skills[k])));
    if (current > start) {
      buildOnlyXp += ((current - start) * (start + 1 + current)) / 2;
    }
  });

  const buildOnlyLevel = levelFromCumulativeXp(buildOnlyXp);
  const currentFloorXp = cumulativeXpForLevel(buildOnlyLevel);

  return {
    buildOnlyXp,
    buildOnlyLevel,
    xpForNextLevel: xpToNextLevel(buildOnlyLevel),
    xpIntoCurrentLevel: Math.max(0, buildOnlyXp - currentFloorXp),
    availablePerkPoints: Math.max(0, buildOnlyLevel - 1),
  };
}

export interface LevelBudgetInput {
  race?: BuildRaceId;
  characterLevel: number;
  conjuration: number;
  illusion: number;
  sneak: number;
  archery: number;
  enchanting: number;
  perksSpent: number;
  plannedLoopIntensity: 'none' | 'moderate' | 'heavy';
}

export interface LevelBudgetAssessment {
  detectedPhase: PhaseId;
  phaseLabel: string;
  phaseLevelCeiling: number | null;
  approximateProjectedLevel: number;
  exceedsPhaseCeiling: boolean;
  conjurationGoalMet: boolean;
  buildOnlyXp: number;
  buildOnlyLevel: number;
  xpToNextLevel: number;
  xpIntoCurrentLevel: number;
  availablePerkPoints: number;
  alerts: Array<{
    severity: 'warning' | 'info' | 'success';
    message: string;
  }>;
  skillTargets: Array<{
    skill: string;
    current: number;
    targetNote: string;
    status: 'on_track' | 'behind' | 'complete';
  }>;
}

export function getPhaseFromLevel(level: number): { id: PhaseId; label: string; ceiling: number | null } {
  if (level <= 10) return { id: 'early', label: 'Early Game (1–10)', ceiling: 10 };
  if (level <= 25) return { id: 'mid', label: 'Mid Game (11–25)', ceiling: 25 };
  if (level <= 45) return { id: 'late', label: 'Late Game (26–45)', ceiling: 45 };
  return { id: 'end', label: 'End-Game (46+)', ceiling: null };
}

/**
 * Evaluates character progression using exact UESP XP formulas (Dossiê Sec. 2.1–2.3).
 * Planned loop impact on level remains explicitly labeled as approximate ("aproximado").
 */
export function evaluateLevelBudget(input: LevelBudgetInput): LevelBudgetAssessment {
  const phase = getPhaseFromLevel(input.characterLevel);
  const race: BuildRaceId = input.race ?? 'breton';
  const progression = calculateBuildProgressionFromSkills(race, {
    Conjuration: input.conjuration,
    Illusion: input.illusion,
    Sneak: input.sneak,
    Archery: input.archery,
    Enchanting: input.enchanting,
  });

  const loopDelta =
    input.plannedLoopIntensity === 'heavy' ? 6 : input.plannedLoopIntensity === 'moderate' ? 3 : 0;
  const approximateProjectedLevel = input.characterLevel + loopDelta;
  const exceedsPhaseCeiling =
    phase.ceiling !== null && approximateProjectedLevel > phase.ceiling;

  const alerts: LevelBudgetAssessment['alerts'] = [];

  if (exceedsPhaseCeiling && phase.ceiling !== null) {
    alerts.push({
      severity: 'warning',
      message: `Atenção (aproximado): o loop planejado pode levar seu personagem ao nível ~${approximateProjectedLevel}, acima do teto de ${phase.ceiling} da fase ${phase.label}. Inimigos escalam com o nível do personagem.`,
    });
  }

  if (input.characterLevel > progression.buildOnlyLevel + 2) {
    alerts.push({
      severity: 'warning',
      message: `Seu nível (${input.characterLevel}) está acima do gerado apenas pelas 5 skills da build (Nv. ${progression.buildOnlyLevel}). Evite treinar habilidades fora da build antes do nível 31.`,
    });
  }

  if (input.characterLevel >= 12 && input.conjuration < 50) {
    alerts.push({
      severity: 'warning',
      message:
        'Seu nível de personagem subiu, mas Conjuration ainda está abaixo de 50. Risco de enfrentar inimigos mais fortes pelo level scaling.',
    });
  }

  if (input.conjuration >= 90 && input.conjuration < 100) {
    alerts.push({
      severity: 'info',
      message:
        'Conjuration perto de 100: você pode usar aulas pagas com Falion (Morthal, até 90) ou Phinis Gestor (até 75) para alcançar Twin Souls.',
    });
  }

  if (progression.buildOnlyLevel >= 31 && input.characterLevel < 46) {
    alerts.push({
      severity: 'info',
      message:
        'Núcleo da build fechado (~Nv. 31): a partir daqui, suba habilidades secundárias de propósito para destravar Elite (Nv. 32), Ascendant (Nv. 40) e Master de Phinis Gestor (Nv. 46+).',
    });
  } else if (input.characterLevel < 46 && input.conjuration >= 100) {
    alerts.push({
      severity: 'info',
      message:
        'Conjuration 100 alcançado (Twin Souls disponível). Os feitiços Master de Phinis Gestor (Bone Colossus e Ancient Deathpriest) só aparecem no estoque a partir do nível 46+ [A/C].',
    });
  }

  alerts.push({
    severity: 'success',
    message: 'Regra do Dossiê: 5 treinos pagos por nível · foque nas 5 skills principais até fechar os 30 perks (~Nv. 31).',
  });

  const skillTargets: LevelBudgetAssessment['skillTargets'] = [
    {
      skill: 'Conjuration',
      current: input.conjuration,
      targetNote: phase.id === 'early' ? 'Meta Early: 40–50' : 'Meta: 100 (Twin Souls)',
      status: input.conjuration >= 100 ? 'complete' : input.conjuration >= (phase.id === 'early' ? 35 : 75) ? 'on_track' : 'behind',
    },
    {
      skill: 'Illusion',
      current: input.illusion,
      targetNote: 'Meta Mid: 50 (Quiet Casting) · Fim: 75',
      status: input.illusion >= 75 ? 'complete' : input.illusion >= 50 ? 'on_track' : 'behind',
    },
    {
      skill: 'Sneak',
      current: input.sneak,
      targetNote: 'Meta: 50 (Muffled Movement + Deadly Aim)',
      status: input.sneak >= 50 ? 'complete' : input.sneak >= 30 ? 'on_track' : 'behind',
    },
    {
      skill: 'Archery',
      current: input.archery,
      targetNote: 'Suporte para Bow of Shadows (Deadly Aim 3x)',
      status: input.archery >= 50 ? 'complete' : input.archery >= 30 ? 'on_track' : 'behind',
    },
    {
      skill: 'Enchanting',
      current: input.enchanting,
      targetNote: 'Meta: 100 (4 peças × 25% = custo zero)',
      status: input.enchanting >= 100 ? 'complete' : input.enchanting >= 50 ? 'on_track' : 'behind',
    },
  ];

  return {
    detectedPhase: phase.id,
    phaseLabel: phase.label,
    phaseLevelCeiling: phase.ceiling,
    approximateProjectedLevel,
    exceedsPhaseCeiling,
    conjurationGoalMet: input.conjuration >= 100,
    buildOnlyXp: progression.buildOnlyXp,
    buildOnlyLevel: progression.buildOnlyLevel,
    xpToNextLevel: progression.xpForNextLevel,
    xpIntoCurrentLevel: progression.xpIntoCurrentLevel,
    availablePerkPoints: progression.availablePerkPoints,
    alerts,
    skillTargets,
  };
}

export function canUnlockPerk(
  perk: Perk,
  purchasedPerkIds: string[],
  skillLevels: Record<string, number>
): { allowed: boolean; reason?: string } {
  const purchased = new Set(purchasedPerkIds);

  if (perk.nivel_habilidade_minimo !== null) {
    const currentSkill = skillLevels[perk.escola] ?? 0;
    if (currentSkill < perk.nivel_habilidade_minimo) {
      return {
        allowed: false,
        reason: `Exige ${perk.escola} ${perk.nivel_habilidade_minimo} (atual: ${currentSkill}).`,
      };
    }
  }

  for (const req of perk.prerequisitos) {
    if (!purchased.has(req)) {
      return {
        allowed: false,
        reason: `Exige pré-requisito anterior marcado na árvore.`,
      };
    }
  }

  if (perk.prerequisitos_ou && perk.prerequisitos_ou.length > 0) {
    const hasAny = perk.prerequisitos_ou.some((req) => purchased.has(req));
    if (!hasAny) {
      return {
        allowed: false,
        reason: `Exige Dark Souls OU Elemental Potency.`,
      };
    }
  }

  return { allowed: true };
}

export function computeQuestStatus(
  quest: Quest,
  completedQuestIds: string[],
  completedStepsByQuest: Record<string, number[]>
): QuestState {
  if (completedQuestIds.includes(quest.id)) {
    return 'concluida';
  }
  const depsMet = quest.dependencias.every((depId) => completedQuestIds.includes(depId));
  if (!depsMet) {
    return 'bloqueada';
  }
  const checkedSteps = completedStepsByQuest[quest.id] ?? [];
  if (checkedSteps.length > 0) {
    return 'em_andamento';
  }
  return 'disponivel';
}
