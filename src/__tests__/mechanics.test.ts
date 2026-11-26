import { describe, expect, it } from 'vitest';
import { dossieMechanics, perks, quests } from '../../src/lib/data';
import {
  calculateBuildProgressionFromSkills,
  calculateMagickaCostReduction,
  canUnlockPerk,
  computeQuestStatus,
  cumulativeXpForLevel,
  evaluateLevelBudget,
  getPhaseFromLevel,
  xpToNextLevel,
} from '../lib/mechanics';

describe('calculateMagickaCostReduction (Dossiê Sec. 2.6: 4x25% = 100% / Custo Zero)', () => {
  it('reaches 100% (0 Magicka cost) with 4 pieces x 25% without waste', () => {
    const res = calculateMagickaCostReduction({
      vokunEquipped: false,
      necromancersAmuletEquipped: true, // 25%
      chestReductionPct: 25,
      handsReductionPct: 25, // representing 4th custom 25% slot (e.g. circlet/head)
      ringReductionPct: 25,
      neckCustomReductionPct: 0,
      hasTierCostPerk: true,
      baseSpellCost: 400,
    });

    expect(res.rawGearReductionPct).toBe(100);
    expect(res.effectiveGearReductionPct).toBe(100);
    expect(res.wastedPct).toBe(0);
    expect(res.exceedsCap).toBe(false);
    expect(res.finalEstimatedCost).toBe(0);
  });

  it('combines Vokun (-20%), Necromancer Amulet (-25%), chest (25%) and ring (25%) to 95%', () => {
    const res = calculateMagickaCostReduction({
      vokunEquipped: true,
      necromancersAmuletEquipped: true,
      chestReductionPct: 25,
      handsReductionPct: 0,
      ringReductionPct: 25,
      neckCustomReductionPct: 0,
      hasTierCostPerk: true,
      baseSpellCost: 400,
    });

    expect(res.rawGearReductionPct).toBe(95);
    expect(res.effectiveGearReductionPct).toBe(95);
    expect(res.wastedPct).toBe(0);
    expect(res.exceedsCap).toBe(false);
    // 400 * 0.5 (perk) * (1 - 0.95) = 200 * 0.05 = 10
    expect(res.finalEstimatedCost).toBe(10);
  });

  it('caps reduction at 100% (0 Magicka) and reports wasted percentage above 100%', () => {
    const res = calculateMagickaCostReduction({
      vokunEquipped: true,
      necromancersAmuletEquipped: true,
      chestReductionPct: 25,
      handsReductionPct: 25,
      ringReductionPct: 25,
      neckCustomReductionPct: 0,
      hasTierCostPerk: false,
      baseSpellCost: 200,
    });

    // 20 + 25 + 25 + 25 + 25 = 120% raw
    expect(res.rawGearReductionPct).toBe(120);
    expect(res.effectiveGearReductionPct).toBe(100);
    expect(res.wastedPct).toBe(20);
    expect(res.exceedsCap).toBe(true);
    expect(res.finalEstimatedCost).toBe(0);
  });
});

describe('UESP exact XP formulas and Breton milestones (Dossiê Sec. 2.1–2.4)', () => {
  it('matches UESP XP-to-next and cumulative XP table', () => {
    expect(xpToNextLevel(5)).toBe(200);
    expect(cumulativeXpForLevel(5)).toBe(550);
    expect(cumulativeXpForLevel(10)).toBe(1800);
    expect(cumulativeXpForLevel(46)).toBe(29250);
    expect(cumulativeXpForLevel(50)).toBe(34300);
  });

  it('reproduces Breton early_end (~9) and build_complete (~31) levels from 5 build skills', () => {
    const earlyEnd = calculateBuildProgressionFromSkills('breton', {
      Conjuration: 40,
      Illusion: 30,
      Sneak: 30,
      Archery: 30,
      Enchanting: 20,
    });
    expect(earlyEnd.buildOnlyLevel).toBe(9);

    const buildComplete = calculateBuildProgressionFromSkills('breton', {
      Conjuration: 100,
      Illusion: 75,
      Sneak: 50,
      Archery: 50,
      Enchanting: 100,
    });
    expect(buildComplete.buildOnlyLevel).toBe(31);
    expect(buildComplete.availablePerkPoints).toBe(30);
  });

  it('confirms 30 perks fit at Breton build_complete level 31 via cumulativeXpForLevel', () => {
    const completeMilestone = dossieMechanics.build_milestones_breton.find(
      (m) => m.id === 'build_complete'
    )!;
    const prog = calculateBuildProgressionFromSkills('breton', {
      Conjuration: completeMilestone.conj,
      Illusion: completeMilestone.ill,
      Sneak: completeMilestone.sneak,
      Archery: completeMilestone.arch,
      Enchanting: completeMilestone.ench,
    });

    expect(prog.buildOnlyLevel).toBe(31);
    expect(prog.buildOnlyXp).toBeGreaterThanOrEqual(cumulativeXpForLevel(31));
    expect(prog.buildOnlyXp).toBeLessThan(cumulativeXpForLevel(32));
    expect(prog.availablePerkPoints).toBe(30);
    expect(dossieMechanics.perk_order_30).toHaveLength(30);
  });

  it('validates all 30 perk_order_30 steps: prerequisites, Breton milestone skill reqs, and rank bounds', () => {
    const completeMilestone = dossieMechanics.build_milestones_breton.find(
      (m) => m.id === 'build_complete'
    )!;
    const skills = {
      Conjuration: completeMilestone.conj,
      Illusion: completeMilestone.ill,
      Sneak: completeMilestone.sneak,
      Archery: completeMilestone.arch,
      Enchanting: completeMilestone.ench,
    };
    const unlocked: string[] = [];
    const seenCounts = new Map<string, number>();

    expect(dossieMechanics.perk_order_30).toHaveLength(30);

    dossieMechanics.perk_order_30.forEach((step, idx) => {
      expect(step.step).toBe(idx + 1);
      const perk = perks.find((p) => p.id === step.perk_id);
      expect(perk).toBeDefined();

      // Verify sequential ranks and no repetition beyond max ranks
      const nextCount = (seenCounts.get(step.perk_id) ?? 0) + 1;
      expect(step.rank).toBe(nextCount);
      expect(nextCount).toBeLessThanOrEqual(perk!.ranks);
      seenCounts.set(step.perk_id, nextCount);

      // Verify prerequisites appear earlier and milestone skills satisfy requirement
      const check = canUnlockPerk(perk!, unlocked, skills);
      expect(check.allowed).toBe(true);
      if (!unlocked.includes(step.perk_id)) {
        unlocked.push(step.perk_id);
      }
    });

    // Confirm Adept Illusion immediately precedes Expert Illusion at steps 22 -> 23
    expect(dossieMechanics.perk_order_30[21].perk_id).toBe('perk_adept_illusion');
    expect(dossieMechanics.perk_order_30[22].perk_id).toBe('perk_expert_illusion');
  });
});

describe('canUnlockPerk (Twin Souls OR-prerequisite rule from Appendix A)', () => {
  const twinSouls = perks.find((p) => p.id === 'perk_twin_souls')!;

  it('blocks Twin Souls when Conjuration is below 100 even with Dark Souls', () => {
    const check = canUnlockPerk(twinSouls, ['perk_dark_souls'], { Conjuration: 90 });
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Conjuration 100');
  });

  it('blocks Twin Souls at Conjuration 100 when neither Dark Souls nor Elemental Potency is unlocked', () => {
    const check = canUnlockPerk(twinSouls, ['perk_novice_conjuration'], { Conjuration: 100 });
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Dark Souls OU Elemental Potency');
  });

  it('allows Twin Souls at Conjuration 100 with Dark Souls OR Elemental Potency', () => {
    expect(canUnlockPerk(twinSouls, ['perk_dark_souls'], { Conjuration: 100 }).allowed).toBe(true);
    expect(canUnlockPerk(twinSouls, ['perk_elemental_potency'], { Conjuration: 100 }).allowed).toBe(
      true
    );
  });
});

describe('evaluateLevelBudget', () => {
  it('detects phase correctly and warns when heavy loop exceeds early ceiling', () => {
    expect(getPhaseFromLevel(5).id).toBe('early');
    expect(getPhaseFromLevel(18).id).toBe('mid');
    expect(getPhaseFromLevel(35).id).toBe('late');
    expect(getPhaseFromLevel(46).id).toBe('end');

    const res = evaluateLevelBudget({
      characterLevel: 8,
      conjuration: 35,
      illusion: 20,
      sneak: 25,
      archery: 15,
      enchanting: 15,
      perksSpent: 6,
      plannedLoopIntensity: 'heavy',
    });

    expect(res.detectedPhase).toBe('early');
    expect(res.exceedsPhaseCeiling).toBe(true);
    expect(res.approximateProjectedLevel).toBe(14);
    expect(res.alerts.some((a) => a.severity === 'warning' && a.message.includes('aproximado'))).toBe(
      true
    );
  });
});

describe('computeQuestStatus', () => {
  const inTheShadows = quests.find((q) => q.id === 'quest_in_the_shadows')!;

  it('returns bloqueada before dependency completion, disponivel after, em_andamento with step, and concluida when done', () => {
    expect(computeQuestStatus(inTheShadows, [], {})).toBe('bloqueada');
    expect(computeQuestStatus(inTheShadows, ['quest_unbound'], {})).toBe('disponivel');
    expect(
      computeQuestStatus(inTheShadows, ['quest_unbound'], { quest_in_the_shadows: [0] })
    ).toBe('em_andamento');
    expect(
      computeQuestStatus(inTheShadows, ['quest_unbound', 'quest_in_the_shadows'], {})
    ).toBe('concluida');
  });
});
