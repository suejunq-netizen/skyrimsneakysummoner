import type { z } from 'zod';
import type {
  ArmyCompositionSchema,
  AttributePlanSchema,
  BugAndWarningSchema,
  CombatAndLoopsSchema,
  ConfidenceTierSchema,
  DossieMechanicsSchema,
  EquipmentChecklistSchema,
  GlossaryEntrySchema,
  GuidedStepSchema,
  HouseSchema,
  ItemSchema,
  LocationSchema,
  MythVsFactSchema,
  PerkSchema,
  PhaseIdSchema,
  PhaseSchema,
  QuestSchema,
  RaceSchema,
  SpellSchema,
  StandingStoneSchema,
} from '../../data/schemas';

export type ConfidenceTier = z.infer<typeof ConfidenceTierSchema>;
export type PhaseId = z.infer<typeof PhaseIdSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
export type Quest = z.infer<typeof QuestSchema>;
export type Spell = z.infer<typeof SpellSchema>;
export type Perk = z.infer<typeof PerkSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type LocationEntry = z.infer<typeof LocationSchema>;
export type House = z.infer<typeof HouseSchema>;
export type StandingStone = z.infer<typeof StandingStoneSchema>;
export type Race = z.infer<typeof RaceSchema>;
export type AttributePlan = z.infer<typeof AttributePlanSchema>;
export type ArmyComposition = z.infer<typeof ArmyCompositionSchema>;
export type BugAndWarning = z.infer<typeof BugAndWarningSchema>;
export type MythVsFact = z.infer<typeof MythVsFactSchema>;
export type GlossaryEntry = z.infer<typeof GlossaryEntrySchema>;
export type EquipmentChecklistSlot = z.infer<typeof EquipmentChecklistSchema>;
export type GuidedStep = z.infer<typeof GuidedStepSchema>;
export type CombatAndLoops = z.infer<typeof CombatAndLoopsSchema>;
export type DossieMechanics = z.infer<typeof DossieMechanicsSchema>;

export type QuestState = 'bloqueada' | 'disponivel' | 'em_andamento' | 'concluida';
