# Arquitetura do Projeto

## Visão Geral

O aplicativo é uma SPA construída com **React 19 + TypeScript + Vite**, preparada para funcionamento **offline-first** via `vite-plugin-pwa` (Workbox) e persistência local com **Zustand** (`localStorage` sob a chave `grimorio-necromante-state-v1`).

## Camadas

1. **Dados Canônicos (`/data/*.json` + `/data/schemas.ts`)**
   - 18 arquivos JSON contendo fases, quests, feitiços, perks, itens, locais, moradias, Standing Stones, raças, plano de atributos, composição do exército, alertas, mitos vs. fatos, glossário, checklist de equipamento, passos guiados, loops/combate e `dossie_mechanics.json` (UESP XP, marcos Breton, gates CC, treinadores e ordem dos 30 perks).
   - Validados em tempo de pré-build por `scripts/validate-data.ts` (Zod + checagem de IDs únicos + integridade referencial, incluindo `perk_order_30`).

2. **Regras de Domínio (`/src/lib/`)**
   - `mechanics.ts`: Cálculo de redução de custo de Magicka até **100% / custo zero** com 4 peças × 25% (o teto de 85% vale apenas para resistências) e alerta de excesso; fórmulas exatas de XP da UESP (`xpToNextLevel`, `cumulativeXpForLevel`, `calculateBuildProgressionFromSkills`); avaliação de orçamento de nível (mantendo estimativa de loop rotulada como *aproximado*); validação de pré-requisitos de perks (incluindo regra `OR` de `Twin Souls`) e máquina de estados de quests (`bloqueada`, `disponivel`, `em_andamento`, `concluida`).
   - `search.ts`: Índice local **Fuse.js** cobrindo todas as entidades do grimório.
   - `i18n.ts`: Configuração `i18next` (`pt-BR` padrão, `en` opcional).

3. **Estado do Jogador (`/src/store/useGrimoireStore.ts`)**
   - Mantém raça, nível, atributos de habilidades da build, passos concluídos, quests, etapas internas de quest, perks comprados, loot coletado, locais visitados, tema (`dark` / `light`), escala de fonte e modo segunda tela.
   - Suporta exportação e importação portátil em JSON.

4. **Interface & Recursos (`/src/features/` e `/src/components/`)**
   - Mapa interativo baseado em `leaflet` com `CRS.Simple` renderizando `/public/assets/skyrim-stylized-map.svg` (`1200x900`), posições estritamente ilustrativas baseadas em descrições relativas (nenhuma coordenada inventada), agrupamento via `leaflet.markercluster`, alertas de *Encounter Zone* e separação explícita para locais com `coordenadas: null`.
   - `VerificationSeal.tsx`: selo visual `"Verificar no jogo"` para todos os registros `[C]`, `[A/C]` ou com `needs_verification: true`.
   - Tema dual em variáveis CSS (`--bg-canvas`, `--accent-gold`, `--accent-ice`, `--accent-emerald`, `--accent-crimson`), suporte a `prefers-reduced-motion` e layout responsivo para segunda tela no celular.

5. **Qualidade, Empacotamento & CI**
   - Gerenciador padrão: **npm** (`package-lock.json`); dependências não utilizadas de backend/SDK (`@google/genai`, `express`, `dotenv`) foram removidas por se tratar de uma SPA 100% client-side/offline-first (`metadata.json` permanece mantido para metadados do manifesto de ambiente).
   - Verificação estática: `tsc --noEmit` (`npm run lint`), **ESLint 10** flat config com `typescript-eslint`, `eslint-plugin-react-hooks` e `eslint-plugin-react-refresh` (`npm run lint:eslint`), além de **Prettier** (`npm run format`).
   - Testes automatizados: testes unitários e de UI via **Vitest + Testing Library** (`npm run test`) e testes E2E em navegador real (desktop e Pixel 7) com **Playwright + `@axe-core/playwright`** sobre `vite preview` (`npm run test:e2e`).
   - Integração contínua (`.github/workflows/ci.yml`): job `verify` executa `validate:data`, `tsc --noEmit`, `eslint`, `vitest` e `build`; job `e2e` constrói o bundle, executa `playwright test` e publica o relatório HTML (`playwright-report/`).
