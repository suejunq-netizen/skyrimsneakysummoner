import React, { useMemo } from 'react';
import { AlertTriangle, BookOpen, ExternalLink, Info, Scale, ShieldCheck } from 'lucide-react';
import {
  armyComposition,
  attributesPlan,
  bugsAndWarnings,
  combatAndLoops,
  equipmentChecklist,
  glossary,
  guidedSteps,
  houses,
  items,
  locations,
  mythsVsFacts,
  perks,
  phases,
  quests,
  races,
  spells,
  standingStones,
} from '../../lib/data';

export const AboutPage: React.FC = () => {
  const auditStats = useMemo(() => {
    const all = [
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
    const pages = new Set(all.map((r) => r.source_page));
    const unverified = all.filter((r) => r.needs_verification).length;
    return {
      totalRecords: all.length,
      pagesCount: pages.size,
      unverifiedCount: unverified,
    };
  }, []);

  const thirdPartyAssets = [
    {
      name: 'React, Vite, Zustand, React Router, Recharts, i18next, Zod, vite-plugin-pwa, Vitest',
      license: 'MIT License',
      note: 'Bibliotecas principais da interface, validação de schemas JSON, estado local e PWA offline.',
    },
    {
      name: 'Fuse.js',
      license: 'Apache-2.0',
      note: 'Busca fuzzy local em quests, feitiços, perks, itens, locais e glossário.',
    },
    {
      name: 'Leaflet & Leaflet.markercluster',
      license: 'BSD-2-Clause / MIT',
      note: 'Renderização do mapa cartográfico próprio em CRS.Simple sem tiles proprietários.',
    },
    {
      name: 'Lucide Icons',
      license: 'ISC License',
      note: 'Iconografia vetorial de código aberto utilizada na navegação e nos alertas.',
    },
    {
      name: 'Cinzel, EB Garamond & JetBrains Mono (Google Fonts)',
      license: 'SIL Open Font License 1.1 (OFL)',
      note: 'Tipografia editorial medieval e algarismos tabulares.',
    },
    {
      name: 'Mapa Estilizado de Skyrim & Solstheim (skyrim-stylized-map.svg) + Ícone do Grimório (icon.svg)',
      license: 'Ativo Original do Projeto (MIT / CC0)',
      note: 'Ilustração cartográfica vetorial original criada especificamente para este companion; não utiliza texturas nem mapas extraídos do jogo.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Legal & Fan Project Disclaimer */}
      <section className="rounded-xl border border-[var(--accent-gold)]/40 bg-[var(--bg-surface)] p-6 space-y-3">
        <div className="flex items-center gap-2 text-[var(--accent-gold)]">
          <Scale className="w-5 h-5 shrink-0" aria-hidden="true" />
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Sobre o Projeto, Créditos &amp; Licenças
          </h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          <strong>Aviso Legal:</strong> Este aplicativo é um{' '}
          <strong>projeto independente de fã</strong>, sem fins comerciais e{' '}
          <strong>não afiliado, endossado ou patrocinado pela Bethesda Softworks ou ZeniMax Media</strong>.
          <em> The Elder Scrolls V: Skyrim Anniversary Edition</em> e todos os nomes de locais, feitiços,
          personagens e missões pertencem aos seus respectivos proprietários.
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Todo o conteúdo de build, progressão, alertas de bugs e ordem de quests foi extraído
          exclusivamente do documento de referência anexo (<em>Grimório do Necromante Furtivo</em>,
          27 páginas) para conteúdo oficial (Vanilla + DLCs + Creation Club da Anniversary Edition),
          sem mods não oficiais.
        </p>
      </section>

      {/* Data Audit Summary */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[var(--accent-emerald)]" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold">
            Auditoria da Base Estruturada (/data)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4">
            <div className="text-xs text-[var(--text-muted)]">Registros Validados (Zod)</div>
            <div className="font-mono-nums text-2xl font-bold text-[var(--accent-gold)] mt-1">
              {auditStats.totalRecords}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              18 arquivos JSON auditados antes do build (incluindo dossie_mechanics.json)
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4">
            <div className="text-xs text-[var(--text-muted)]">Páginas do PDF Referenciadas</div>
            <div className="font-mono-nums text-2xl font-bold text-[var(--text-primary)] mt-1">
              {auditStats.pagesCount}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              Hierarquia: Dossiê / UESP [A] &gt; PDF original
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4">
            <div className="text-xs text-[var(--text-muted)]">Sinalizados para Verificação</div>
            <div className="font-mono-nums text-2xl font-bold text-[var(--accent-ice)] mt-1">
              {auditStats.unverifiedCount}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              Exibem selo &ldquo;Verificar no jogo&rdquo; [C] / [A/C]
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/60 p-3.5 text-xs text-[var(--text-secondary)] space-y-1.5">
          <div className="font-semibold text-[var(--text-primary)]">
            Selo de Confiabilidade do Dossiê:
          </div>
          <div>
            <strong>[A]</strong> Confirmado na UESP (fonte primária) ·{' '}
            <strong>[B]</strong> Apenas fonte secundária (Fextralife / GameBanshee) ·{' '}
            <strong>[C]</strong> Fonte fraca, conflitante ou não confirmada — exibido com o selo{' '}
            <strong className="text-[var(--accent-gold)]">&ldquo;Verificar no jogo&rdquo;</strong>.
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/60 p-3.5">
          <AlertTriangle className="w-4 h-4 text-[var(--accent-gold)] shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Nenhum tile, marcador ou banco de dados do MapGenie foi raspado ou incorporado, e nenhuma
            coordenada exata de mapa foi inventada (as posições do mapa estilizado são ilustrativas
            com base apenas em descrições relativas). Links externos opcionais abrem em nova aba.
          </span>
        </div>
      </section>

      {/* External Reference Attribution (UESP CC BY-SA) */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--accent-ice)]" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold">
            Referências Externas &amp; Atribuição
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Fórmulas de nível, atributos, quests e localizações seguem a{' '}
          <strong>UESP (Unofficial Elder Scrolls Pages)</strong> — conteúdo comunitário disponível sob{' '}
          <a
            href="https://creativecommons.org/licenses/by-sa/2.5/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-gold)] hover:underline inline-flex items-center gap-1"
          >
            CC BY-SA 2.5 <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>{' '}
          — com consulta complementar em Fextralife, GameBanshee e links externos em nova aba para{' '}
          <a
            href="https://mapgenie.io/skyrim"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-gold)] hover:underline inline-flex items-center gap-1"
          >
            MapGenie Skyrim <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
          .
        </p>
      </section>

      {/* Open Source & Asset Licenses */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-[var(--accent-gold)]" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold">
            Licenças de Software Livre &amp; Assets
          </h2>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {thirdPartyAssets.map((item) => (
            <div key={item.name} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-sm text-[var(--text-primary)]">{item.name}</div>
                <div className="text-xs text-[var(--text-secondary)]">{item.note}</div>
              </div>
              <span className="font-mono-nums text-xs text-[var(--accent-gold)] whitespace-nowrap">
                {item.license}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
