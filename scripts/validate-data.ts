import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import {
  ArmyCompositionSchema,
  AttributePlanSchema,
  BugAndWarningSchema,
  CombatAndLoopsSchema,
  DossieMechanicsSchema,
  EquipmentChecklistSchema,
  GlossaryEntrySchema,
  GuidedStepSchema,
  HouseSchema,
  ItemSchema,
  LocationSchema,
  MythVsFactSchema,
  PerkSchema,
  LevelPlanSchema,
  PhaseSchema,
  QuestSchema,
  RaceSchema,
  SpellSchema,
  StandingStoneSchema,
} from '../data/schemas.ts';

const dataDir = path.resolve(process.cwd(), 'data');

function readJson<T>(filename: string): T {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required data file: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function assertUniqueIds(items: Array<{ id: string }>, fileLabel: string): Set<string> {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      throw new Error(`Duplicate ID "${item.id}" found in ${fileLabel}`);
    }
    seen.add(item.id);
  }
  return seen;
}

function main() {
  const phases = z.array(PhaseSchema).parse(readJson('phases.json'));
  const quests = z.array(QuestSchema).parse(readJson('quests.json'));
  const spells = z.array(SpellSchema).parse(readJson('spells.json'));
  const perks = z.array(PerkSchema).parse(readJson('perks.json'));
  const items = z.array(ItemSchema).parse(readJson('items.json'));
  const locations = z.array(LocationSchema).parse(readJson('locations.json'));
  const houses = z.array(HouseSchema).parse(readJson('houses.json'));
  const standingStones = z.array(StandingStoneSchema).parse(readJson('standing_stones.json'));
  const races = z.array(RaceSchema).parse(readJson('races.json'));
  const attributesPlan = z.array(AttributePlanSchema).parse(readJson('attributes_plan.json'));
  const armyComposition = z.array(ArmyCompositionSchema).parse(readJson('army_composition.json'));
  const bugsAndWarnings = z.array(BugAndWarningSchema).parse(readJson('bugs_and_warnings.json'));
  const mythsVsFacts = z.array(MythVsFactSchema).parse(readJson('myths_vs_facts.json'));
  const glossary = z.array(GlossaryEntrySchema).parse(readJson('glossary.json'));
  const equipmentChecklist = z.array(EquipmentChecklistSchema).parse(readJson('equipment_checklist.json'));
  const guidedSteps = z.array(GuidedStepSchema).parse(readJson('guided_steps.json'));
  const combatAndLoops = CombatAndLoopsSchema.parse(readJson('combat_and_loops.json'));
  const levelPlan = LevelPlanSchema.parse(readJson('level_plan.json'));
  const dossieMechanics = DossieMechanicsSchema.parse(readJson('dossie_mechanics.json'));

  const phaseIds = assertUniqueIds(phases, 'phases.json');
  const questIds = assertUniqueIds(quests, 'quests.json');
  assertUniqueIds(spells, 'spells.json');
  const perkIds = assertUniqueIds(perks, 'perks.json');
  const itemIds = assertUniqueIds(items, 'items.json');
  const locationIds = assertUniqueIds(locations, 'locations.json');
  assertUniqueIds(houses, 'houses.json');
  assertUniqueIds(standingStones, 'standing_stones.json');
  assertUniqueIds(races, 'races.json');
  assertUniqueIds(attributesPlan, 'attributes_plan.json');
  assertUniqueIds(armyComposition, 'army_composition.json');
  assertUniqueIds(bugsAndWarnings, 'bugs_and_warnings.json');
  assertUniqueIds(mythsVsFacts, 'myths_vs_facts.json');
  assertUniqueIds(glossary, 'glossary.json');
  assertUniqueIds(equipmentChecklist, 'equipment_checklist.json');
  assertUniqueIds(guidedSteps, 'guided_steps.json');

  // Referential integrity checks
  for (const q of quests) {
    if (!phaseIds.has(q.fase)) throw new Error(`Quest ${q.id} references unknown phase ${q.fase}`);
    if (q.location_id && !locationIds.has(q.location_id)) {
      throw new Error(`Quest ${q.id} references unknown location ${q.location_id}`);
    }
    for (const dep of q.dependencias) {
      if (!questIds.has(dep)) throw new Error(`Quest ${q.id} references unknown dependency ${dep}`);
    }
  }

  for (const p of perks) {
    for (const req of p.prerequisitos) {
      if (!perkIds.has(req)) throw new Error(`Perk ${p.id} references unknown prerequisite ${req}`);
    }
    for (const req of p.prerequisitos_ou) {
      if (!perkIds.has(req)) throw new Error(`Perk ${p.id} references unknown OR prerequisite ${req}`);
    }
  }

  const perkMap = new Map(perks.map((p) => [p.id, p]));
  const unlockedPerks = new Set<string>();
  const purchasedRankCount = new Map<string, number>();

  for (let idx = 0; idx < dossieMechanics.perk_order_30.length; idx++) {
    const entry = dossieMechanics.perk_order_30[idx];
    if (entry.step !== idx + 1) {
      throw new Error(`dossie_mechanics.perk_order_30 step out of order at index ${idx}: got ${entry.step}`);
    }
    const targetPerk = perkMap.get(entry.perk_id);
    if (!targetPerk) {
      throw new Error(`dossie_mechanics.perk_order_30 step ${entry.step} references unknown perk ${entry.perk_id}`);
    }
    const expectedRank = (purchasedRankCount.get(entry.perk_id) ?? 0) + 1;
    if (entry.rank !== expectedRank || entry.rank > targetPerk.ranks) {
      throw new Error(
        `dossie_mechanics.perk_order_30 step ${entry.step} has invalid rank ${entry.rank} for ${entry.perk_id} (expected ${expectedRank}, max ${targetPerk.ranks})`
      );
    }
    for (const req of targetPerk.prerequisitos) {
      if (!unlockedPerks.has(req)) {
        throw new Error(
          `dossie_mechanics.perk_order_30 step ${entry.step} (${entry.perk_id}) appears before prerequisite ${req}`
        );
      }
    }
    if (targetPerk.prerequisitos_ou.length > 0 && !targetPerk.prerequisitos_ou.some((req) => unlockedPerks.has(req))) {
      throw new Error(
        `dossie_mechanics.perk_order_30 step ${entry.step} (${entry.perk_id}) appears before any OR prerequisite`
      );
    }
    unlockedPerks.add(entry.perk_id);
    purchasedRankCount.set(entry.perk_id, entry.rank);
  }

  for (const i of items) {
    if (i.location_id && !locationIds.has(i.location_id)) {
      throw new Error(`Item ${i.id} references unknown location ${i.location_id}`);
    }
    if (i.quest_id && !questIds.has(i.quest_id)) {
      throw new Error(`Item ${i.id} references unknown quest ${i.quest_id}`);
    }
  }

  for (const h of houses) {
    if (!locationIds.has(h.location_id)) throw new Error(`House ${h.id} references unknown location ${h.location_id}`);
    for (const qid of h.quest_ids) {
      if (!questIds.has(qid)) throw new Error(`House ${h.id} references unknown quest ${qid}`);
    }
  }

  for (const s of standingStones) {
    if (!locationIds.has(s.location_id)) throw new Error(`StandingStone ${s.id} references unknown location ${s.location_id}`);
  }

  for (const b of bugsAndWarnings) {
    if (b.quest_id && !questIds.has(b.quest_id)) {
      throw new Error(`Warning ${b.id} references unknown quest ${b.quest_id}`);
    }
  }

  for (const eq of equipmentChecklist) {
    for (const iid of eq.item_ids) {
      if (!itemIds.has(iid)) throw new Error(`EquipmentChecklist ${eq.id} references unknown item ${iid}`);
    }
  }

  for (const step of guidedSteps) {
    if (step.location_id && !locationIds.has(step.location_id)) {
      throw new Error(`GuidedStep ${step.id} references unknown location ${step.location_id}`);
    }
    if (step.quest_id && !questIds.has(step.quest_id)) {
      throw new Error(`GuidedStep ${step.id} references unknown quest ${step.quest_id}`);
    }
  }

  // Coverage report across content pages (PDF pages 4-27)
  const pagesCovered = new Set<number>();
  const allRecords = [
    ...phases,
    ...quests,
    ...spells,
    ...perks,
    ...items,
    ...locations,
    ...houses,
    ...standingStones,
    ...races,
    ...attributesPlan,
    ...armyComposition,
    ...bugsAndWarnings,
    ...mythsVsFacts,
    ...glossary,
    ...equipmentChecklist,
    ...guidedSteps,
    ...combatAndLoops.loops,
    ...combatAndLoops.combat_cycle,
    ...combatAndLoops.troubleshooting,
    ...combatAndLoops.beginner_mistakes,
    ...combatAndLoops.final_checklist,
  ];
  for (const r of allRecords) {
    pagesCovered.add(r.source_page);
  }

  // Level plan integrity: sequential levels, perks match perk_order, at most 30 perks bought
  const orderLabels = new Set(dossieMechanics.perk_order_30.map((s) => s.label.replace(/\/\d+$/, '')));
  let boughtTotal = 0;
  levelPlan.levels.forEach((lv, idx) => {
    if (lv.nivel !== idx + 1) throw new Error(`level_plan level at index ${idx} has nivel ${lv.nivel}`);
    for (const label of lv.perks_comprados) {
      if (!orderLabels.has(label)) throw new Error(`level_plan level ${lv.nivel} buys unknown perk ${label}`);
      boughtTotal += 1;
    }
  });
  if (boughtTotal !== dossieMechanics.perk_order_30.length) {
    throw new Error(`level_plan buys ${boughtTotal} perks but perk_order has ${dossieMechanics.perk_order_30.length}`);
  }
  for (let i = 1; i < levelPlan.gates.length; i++) {
    if (levelPlan.gates[i].nivel <= levelPlan.gates[i - 1].nivel) {
      throw new Error('level_plan gates must be in ascending level order');
    }
  }

  console.log('=== DATA VALIDATION PASSED ===');
  console.log(`Total validated records: ${allRecords.length} + dossie_mechanics.json (19 data files)`);
  console.log(`Content pages covered (PDF 4-27): ${Array.from(pagesCovered).sort((a, b) => a - b).join(', ')}`);
  console.log(`Records flagged needs_verification: ${allRecords.filter((r) => r.needs_verification).length}`);
}

main();
