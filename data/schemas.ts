import { z } from 'zod';

export const ConfidenceSchema = z.enum(['high', 'medium', 'low']);

export const ConfidenceTierSchema = z.enum(['A', 'B', 'C', 'A/B', 'A/C']);

export const SourceMetaSchema = z.object({
  source_page: z.number().int().min(1).max(27),
  confidence: ConfidenceSchema,
  confidence_tier: ConfidenceTierSchema.optional(),
  game_version_note: z.string().min(1),
  needs_verification: z.boolean().default(false),
});

export const PhaseIdSchema = z.enum(['early', 'mid', 'late', 'end']);

export const PhaseSchema = SourceMetaSchema.extend({
  id: PhaseIdSchema,
  ordem: z.number().int().min(1).max(4),
  nome: z.string().min(1),
  faixa_de_nivel: z.string().min(1),
  nivel_min: z.number().int().min(1),
  nivel_max: z.number().int().nullable(),
  narrativa_abertura: z.string().min(1),
  objetivos: z.array(z.string().min(1)).min(1),
  checklist: z.array(
    z.object({
      id: z.string().min(1),
      texto: z.string().min(1),
    })
  ).min(1),
  ponto_de_verificacao: z.string().min(1),
  meta_habilidades: z.record(z.string(), z.string()),
});

export const QuestSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  nome_en: z.string().min(1),
  nome_pt: z.string().min(1),
  fase: PhaseIdSchema,
  regiao: z.string().min(1),
  dlc: z.enum(['Vanilla', 'Dawnguard', 'Dragonborn', 'Creation Club']),
  nivel_recomendado: z.string().min(1),
  nivel_minimo_zona: z.number().int().min(1).nullable().optional(),
  reward_gold_by_level: z.record(z.string(), z.number()).optional(),
  onde_iniciar: z.string().min(1),
  location_id: z.string().nullable(),
  npc: z.string().min(1),
  passos: z.array(z.string().min(1)).min(1),
  recompensas: z.array(z.string().min(1)),
  bugs_conhecidos: z.array(z.string().min(1)),
  salvar_antes: z.boolean(),
  dependencias: z.array(z.string()),
  tempo_estimado_min: z.number().positive().nullable(),
});

export const SpellPackageSchema = z.enum([
  'vanilla',
  'Necromantic Grimoire',
  'Arcane Accessories',
  'Dawnguard',
  'Dragonborn',
  'Arcane Archer Pack',
]);

export const SpellSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  nome: z.string().min(1),
  escola: z.enum(['Conjuration', 'Illusion', 'Destruction', 'Restoration']),
  nivel_de_habilidade: z.string().min(1),
  custo_magicka: z.union([z.number().nonnegative(), z.string().min(1)]),
  duracao_s: z.union([z.number().nonnegative(), z.string().min(1), z.null()]),
  efeito: z.string().min(1),
  onde_obter: z.array(z.string().min(1)).min(1),
  pacote: SpellPackageSchema,
  estoque_minimo_nivel: z.number().int().min(1).nullable(),
});

export const PerkSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  nome: z.string().min(1),
  escola: z.enum(['Conjuration', 'Illusion', 'Sneak', 'Archery', 'Enchanting']),
  prerequisitos: z.array(z.string()),
  prerequisitos_ou: z.array(z.string()).optional().default([]),
  nivel_habilidade_minimo: z.number().int().min(0).max(100).nullable(),
  ranks: z.number().int().min(1).max(5).default(1),
  prioridade: z.enum(['obrigatorio', 'opcional']),
  fase_recomendada: PhaseIdSchema,
  nota: z.string().min(1),
  tree_row: z.number().int().min(0),
  tree_col: z.number().int().min(0),
});

export const ItemSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  nome: z.string().min(1),
  tipo: z.string().min(1),
  slot: z.enum(['cabeca', 'peito', 'maos', 'botas', 'amuleto', 'anel', 'arma', 'consumivel', 'gema']),
  efeito: z.string().min(1),
  como_obter: z.string().min(1),
  location_id: z.string().nullable(),
  quest_id: z.string().nullable(),
  fase: PhaseIdSchema,
  encantamento_sugerido: z.string().min(1),
  tradeoffs: z.string().nullable(),
  reducao_magicka_pct: z.number().min(0).max(100).default(0),
  escolas_reduzidas: z.array(z.string()).default([]),
});

export const LocationTypeSchema = z.enum([
  'cidade',
  'masmorra',
  'moradia',
  'santuario',
  'pedra',
]);

export const LocationCategorySchema = z.enum([
  'Quest',
  'Masmorra',
  'Moradia',
  'Mestre/Treinador',
  'Standing Stone',
  'Santuario',
  'Loot-chave',
  'Perigo',
]);

export const LocationSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  nome: z.string().min(1),
  regiao: z.string().min(1),
  tipo: LocationTypeSchema,
  categorias: z.array(LocationCategorySchema).min(1),
  dlc: z.enum(['Vanilla', 'Dawnguard', 'Dragonborn', 'Creation Club']),
  coordenadas: z.tuple([z.number(), z.number()]).nullable(),
  nivel_minimo_zona: z.number().int().min(1).nullable().optional(),
  relacionado_a: z.array(z.string()),
  fase: PhaseIdSchema,
  perigo: z.number().int().min(1).max(5),
  o_que_lootear: z.array(z.string()),
  descricao: z.string().min(1),
  uesp_url: z.string().url().nullable(),
  mapgenie_url: z.string().url().nullable(),
});

export const HouseSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  nome: z.string().min(1),
  pacote: z.string().min(1),
  localizacao: z.string().min(1),
  location_id: z.string().min(1),
  nivel_minimo: z.number().int().min(1),
  requisitos: z.array(z.string().min(1)).min(1),
  quest_ids: z.array(z.string()),
  beneficios: z.array(z.string().min(1)),
  riscos: z.array(z.string().min(1)),
  fase_recomendada: PhaseIdSchema,
});

export const StandingStoneSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  nome: z.string().min(1),
  efeito: z.string().min(1),
  local: z.string().min(1),
  location_id: z.string().min(1),
  recomendacao: z.string().min(1),
});

export const RaceSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  nome: z.string().min(1),
  bonus: z.string().min(1),
  justificativa: z.string().min(1),
});

export const AttributePlanSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  faixa_de_nivel: z.string().min(1),
  proporcao_m_h_s: z.string().min(1),
  magicka_ratio: z.number().int().min(0),
  health_ratio: z.number().int().min(0),
  stamina_ratio: z.number().int().min(0),
  objetivo: z.string().min(1),
});

export const ArmyCompositionSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  fase: PhaseIdSchema,
  faixa_de_nivel: z.string().min(1),
  composicao_esperada: z.string().min(1),
  invocacoes_simultaneas: z.number().int().min(1),
  total_aliados: z.number().int().min(1),
  reducao_magicka_planejada_pct: z.number().int().min(0).max(100),
  regras_limite: z.array(z.string().min(1)).min(1),
});

export const BugAndWarningSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  titulo: z.string().min(1),
  tipo: z.enum(['Alerta de Bug', 'Exploit e Otimizacao', 'Dica de Iniciante', 'Regra de Ouro', 'Teste antes da luta']),
  quest_id: z.string().nullable(),
  fase: PhaseIdSchema.nullable(),
  descricao: z.string().min(1),
  acao_preventiva: z.string().min(1),
});

export const MythVsFactSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  alegacao_comum: z.string().min(1),
  o_que_foi_conferido: z.string().min(1),
  categoria: z.enum(['confirmado_parcial', 'corrigido', 'confirmado', 'omitido']),
});

export const GlossaryEntrySchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  termo_pt: z.string().min(1),
  termo_en: z.string().min(1),
  significado: z.string().min(1),
  origem: z.enum(['Cap. 1', 'Apêndice B']),
});

export const EquipmentChecklistSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  slot: z.enum(['cabeca', 'peito', 'maos', 'botas', 'amuleto', 'anel', 'arma']),
  slot_label: z.string().min(1),
  item_recomendado: z.string().min(1),
  item_ids: z.array(z.string()),
  encantamento_observacao: z.string().min(1),
});

export const GuidedStepSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  ordem: z.number().int().min(1),
  fase: PhaseIdSchema,
  titulo: z.string().min(1),
  onde_ir: z.string().min(1),
  location_id: z.string().nullable(),
  com_quem_falar: z.string().nullable(),
  o_que_fazer: z.array(z.string().min(1)).min(1),
  o_que_lootear: z.array(z.string()),
  quest_id: z.string().nullable(),
  salvar_antes: z.boolean(),
  callout_tipo: z.enum(['Dica de Iniciante', 'Exploit e Otimizacao', 'Alerta de Bug', 'Regra de Ouro', 'Teste antes da luta']).nullable(),
  callout_texto: z.string().nullable(),
});

export const LevelingLoopSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  nome: z.string().min(1),
  escola: z.enum(['Conjuration', 'Illusion', 'Enchanting']),
  passos: z.array(z.string().min(1)).min(1),
  wait_hours: z.number().int().min(0),
  aviso_nivel: z.string().min(1),
  dica: z.string().min(1),
});

export const TroubleshootingRowSchema = SourceMetaSchema.extend({
  id: z.string().min(1),
  problema: z.string().min(1),
  causa_provavel: z.string().min(1),
  solucao: z.string().min(1),
});

export const CombatAndLoopsSchema = z.object({
  loops: z.array(LevelingLoopSchema).min(1),
  combat_cycle: z.array(
    SourceMetaSchema.extend({
      id: z.string().min(1),
      passo: z.number().int().min(1),
      titulo: z.string().min(1),
      descricao: z.string().min(1),
    })
  ).min(1),
  troubleshooting: z.array(TroubleshootingRowSchema).min(1),
  beginner_mistakes: z.array(
    SourceMetaSchema.extend({
      id: z.string().min(1),
      erro: z.string().min(1),
      motivo: z.string().min(1),
    })
  ).min(1),
  final_checklist: z.array(
    SourceMetaSchema.extend({
      id: z.string().min(1),
      ordem: z.number().int().min(1),
      texto: z.string().min(1),
    })
  ).min(1),
});

export const DossieMechanicsSchema = z.object({
  meta: z.object({
    date: z.string().min(1),
    primary_source: z.string().min(1),
    coordinates_policy: z.string().min(1),
  }),
  level_math: z.object({
    xp_to_next_formula: z.string().min(1),
    xp_cumulative_formula: z.string().min(1),
    char_xp_per_skill_up: z.string().min(1),
    perk_points_rule: z.string().min(1),
    training: z.object({
      max_per_level: z.number().int().positive(),
      caps: z.object({
        common: z.number().int().positive(),
        expert: z.number().int().positive(),
        master: z.number().int().positive(),
      }),
    }),
    cumulative_xp: z.record(z.string(), z.number().int().nonnegative()),
  }),
  build_milestones_breton: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      conj: z.number().int().min(15).max(100),
      ill: z.number().int().min(15).max(100),
      sneak: z.number().int().min(15).max(100),
      arch: z.number().int().min(15).max(100),
      ench: z.number().int().min(15).max(100),
      approx_level: z.number().int().min(1),
    })
  ).min(1),
  cc_level_gates: z.object({
    phinis_stock: z.object({
      apprentice: z.number().int(),
      novice: z.number().int(),
      adept: z.number().int(),
      expert: z.number().int(),
      master: z.number().int(),
      confidence_tier: ConfidenceTierSchema,
    }),
    necromancer_robes: z.object({
      basic: z.number().int(),
      quickening: z.number().int(),
      recharging: z.number().int(),
      replenishing: z.number().int(),
      elite: z.number().int(),
      ascendant: z.number().int(),
      confidence_tier: ConfidenceTierSchema,
    }),
  }),
  trainers: z.array(
    z.object({
      id: z.string().min(1),
      escola: z.string().min(1),
      npc: z.string().min(1),
      local: z.string().min(1),
      tier: z.enum(['Comum (50)', 'Expert (75)', 'Master (90)']),
      cap: z.number().int(),
      confidence_tier: ConfidenceTierSchema,
    })
  ).min(1),
  perk_order_30: z.array(
    z.object({
      step: z.number().int().min(1).max(30),
      perk_id: z.string().min(1),
      rank: z.number().int().min(1).max(5),
      label: z.string().min(1),
    })
  ).length(30),
  unconfirmed_items: z.array(
    z.object({
      id: z.string().min(1),
      texto: z.string().min(1),
      confidence_tier: ConfidenceTierSchema,
    })
  ).min(1),
});


