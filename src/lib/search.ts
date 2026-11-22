import Fuse from 'fuse.js';
import {
  glossary,
  guidedSteps,
  items,
  locations,
  mythsVsFacts,
  perks,
  quests,
  spells,
} from './data';

export interface SearchDocument {
  id: string;
  kind: 'Quest' | 'Feitiço' | 'Perk' | 'Item' | 'Local' | 'Mito vs. Fato' | 'Glossário' | 'Passo da Rota';
  title: string;
  subtitle: string;
  route: string;
  sourcePage: number;
  needsVerification: boolean;
}

const searchDocs: SearchDocument[] = [
  ...guidedSteps.map((s) => ({
    id: s.id,
    kind: 'Passo da Rota' as const,
    title: s.titulo,
    subtitle: `${s.onde_ir} — ${s.o_que_fazer[0] ?? ''}`,
    route: '/rota',
    sourcePage: s.source_page,
    needsVerification: s.needs_verification,
  })),
  ...quests.map((q) => ({
    id: q.id,
    kind: 'Quest' as const,
    title: `${q.nome_en} (${q.nome_pt})`,
    subtitle: `${q.regiao} · ${q.npc} · ${q.recompensas.join(', ')}`,
    route: '/quests',
    sourcePage: q.source_page,
    needsVerification: q.needs_verification,
  })),
  ...spells.map((s) => ({
    id: s.id,
    kind: 'Feitiço' as const,
    title: s.nome,
    subtitle: `${s.escola} · ${s.pacote} · ${s.efeito}`,
    route: '/grimorio',
    sourcePage: s.source_page,
    needsVerification: s.needs_verification,
  })),
  ...perks.map((p) => ({
    id: p.id,
    kind: 'Perk' as const,
    title: p.nome,
    subtitle: `${p.escola} · ${p.nota}`,
    route: '/perks',
    sourcePage: p.source_page,
    needsVerification: p.needs_verification,
  })),
  ...items.map((i) => ({
    id: i.id,
    kind: 'Item' as const,
    title: i.nome,
    subtitle: `${i.slot} · ${i.efeito}`,
    route: '/equipamento',
    sourcePage: i.source_page,
    needsVerification: i.needs_verification,
  })),
  ...locations.map((l) => ({
    id: l.id,
    kind: 'Local' as const,
    title: l.nome,
    subtitle: `${l.regiao} · ${l.descricao}`,
    route: '/mapa',
    sourcePage: l.source_page,
    needsVerification: l.needs_verification,
  })),
  ...mythsVsFacts.map((m) => ({
    id: m.id,
    kind: 'Mito vs. Fato' as const,
    title: m.alegacao_comum,
    subtitle: m.o_que_foi_conferido,
    route: '/mitos',
    sourcePage: m.source_page,
    needsVerification: m.needs_verification,
  })),
  ...glossary.map((g) => ({
    id: g.id,
    kind: 'Glossário' as const,
    title: `${g.termo_en} (${g.termo_pt})`,
    subtitle: g.significado,
    route: '/glossario',
    sourcePage: g.source_page,
    needsVerification: g.needs_verification,
  })),
];

const fuse = new Fuse(searchDocs, {
  keys: ['title', 'subtitle', 'kind'],
  threshold: 0.35,
  includeScore: true,
});

export function searchGrimoire(query: string): SearchDocument[] {
  const trimmed = query.trim();
  if (!trimmed) return searchDocs.slice(0, 12);
  return fuse.search(trimmed, { limit: 24 }).map((r) => r.item);
}
