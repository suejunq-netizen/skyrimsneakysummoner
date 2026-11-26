import armyCompositionJson from '../../data/army_composition.json';
import attributesPlanJson from '../../data/attributes_plan.json';
import bugsAndWarningsJson from '../../data/bugs_and_warnings.json';
import combatAndLoopsJson from '../../data/combat_and_loops.json';
import dossieMechanicsJson from '../../data/dossie_mechanics.json';
import equipmentChecklistJson from '../../data/equipment_checklist.json';
import glossaryJson from '../../data/glossary.json';
import guidedStepsJson from '../../data/guided_steps.json';
import housesJson from '../../data/houses.json';
import itemsJson from '../../data/items.json';
import levelPlanJson from '../../data/level_plan.json';
import locationsJson from '../../data/locations.json';
import mythsVsFactsJson from '../../data/myths_vs_facts.json';
import perksJson from '../../data/perks.json';
import phasesJson from '../../data/phases.json';
import questsJson from '../../data/quests.json';
import racesJson from '../../data/races.json';
import spellsJson from '../../data/spells.json';
import standingStonesJson from '../../data/standing_stones.json';
import type {
  ArmyComposition,
  AttributePlan,
  BugAndWarning,
  CombatAndLoops,
  DossieMechanics,
  EquipmentChecklistSlot,
  GlossaryEntry,
  GuidedStep,
  House,
  Item,
  LevelPlan,
  LocationEntry,
  MythVsFact,
  Perk,
  Phase,
  Quest,
  Race,
  Spell,
  StandingStone,
} from '../types/grimoire';

export const phases = phasesJson as Phase[];
export const quests = questsJson as Quest[];
export const spells = spellsJson as Spell[];
export const perks = perksJson as Perk[];
export const items = itemsJson as Item[];
export const locations = locationsJson as LocationEntry[];
export const houses = housesJson as House[];
export const standingStones = standingStonesJson as StandingStone[];
export const races = racesJson as Race[];
export const attributesPlan = attributesPlanJson as AttributePlan[];
export const armyComposition = armyCompositionJson as ArmyComposition[];
export const bugsAndWarnings = bugsAndWarningsJson as BugAndWarning[];
export const mythsVsFacts = mythsVsFactsJson as MythVsFact[];
export const glossary = glossaryJson as GlossaryEntry[];
export const equipmentChecklist = equipmentChecklistJson as EquipmentChecklistSlot[];
export const guidedSteps = guidedStepsJson as GuidedStep[];
export const combatAndLoops = combatAndLoopsJson as CombatAndLoops;
export const dossieMechanics = dossieMechanicsJson as DossieMechanics;
export const levelPlan = levelPlanJson as LevelPlan;
