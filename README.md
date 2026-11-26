# Grimório do Necromante Furtivo — Companion Interativo

Companion web offline-first (PWA) em `pt-BR` (com alternância opcional para `en`) dedicado à jornada completa da build **Stealth Necromancer Summoner** em *The Elder Scrolls V: Skyrim Anniversary Edition* (conteúdo oficial: Vanilla + DLCs + Creation Club, sem mods), da fuga de Helgen ao nível 46+.

> **Aviso Legal:** Projeto independente de fã, sem fins comerciais e não afiliado à Bethesda Softworks ou ZeniMax Media.

## Recursos Principais

- **Painel da jornada**: mostra a primeira etapa pendente, instruções, personagem a procurar e atalhos para a etapa exata e seu local no mapa. O seletor de fases acompanha as etapas concluídas e permite consultar as próximas sem alterar o progresso salvo. A paisagem de abertura é uma ilustração original.

- **Nível a Nível (`/niveis`)**: Para cada nível de 1 a 46: o que fazer (quests, loot, equipamento, treino, avisos com selo de confiança), perks liberados (simulação da ordem de 30 perks contra o requisito de habilidade), metas de habilidade, travas de equipamento com contagem de níveis restantes e grind controlado após o nível 31. Arte original em SVG (banner nórdico por fase, anel rúnico, ícones temáticos).
- **Rota Guiada (`/rota`)**: Modo *Próximo passo* com uma ação por vez, barras de progresso por fase (`Early`, `Mid`, `Late`, `End`), checklists de verificação, Apêndice C e tabela de solução de problemas.
- **Diário de Quests (`/quests`)**: Filtros por fase, região e DLC, dependências automáticas (`bloqueada`, `disponivel`, `em_andamento`, `concluida`), passos marcáveis e modal preventivo de save separado (`SaveReminderModal`).
- **Grimório de Feitiços (`/grimorio`)**: Catálogo filtrável por escola, pacote oficial e custo de Magicka, destacando os gates de Phinis Gestor (`1/10/20/35/46`) e selo `"Verificar no jogo"` para itens `[C]`/`[A/C]`.
- **Árvore de Perks (`/perks`)**: Validação interativa dos pré-requisitos da Figura 3, UESP e Apêndice A (incluindo `Twin Souls`: `Conjuration 100` e `Dark Souls` **ou** `Elemental Potency`), ordem recomendada dos 30 perks e nota de respec (*Waking Dreams*).
- **Exército & Calculadora de Magicka (`/exercito`)**: Simulador de invocações + seguidor + animal com gráfico por fase, alerta de despawn de *Bone Colossus* + *Twin Souls* `[A/C]` e calculadora com redução até **100% (custo ZERO com 4 peças × 25%; o teto de 85% vale apenas para resistências)**.
- **Mapa Interativo Próprio (`/mapa`)**: Leaflet `CRS.Simple` sobre ilustração cartográfica original (`/public/assets/skyrim-stylized-map.svg`), posições ilustrativas baseadas apenas em descrições relativas (nenhuma coordenada inventada), alerta de *Encounter Zone*, *"Onde focar agora"* e barra lateral para locais sem coordenada.
- **Arsenal, Loadout & Moradias (`/equipamento`)**: Checklist dos 7 slots, compras por vendedor e guia das moradias gratuitas da AE (`Myrwatch`, `Goldenhills Plantation`, `Bloodchill Manor`).
- **Orçamento de Nível & Loops (`/orcamento`)**: Fórmulas exatas de XP da UESP (`(N+3)×25` e `12,5×N² + 62,5×N − 75`), marcos da build (Breton ~Nv. 31), tabela de treinadores (`5 treinos/nível`), loops (`Soul Trap`, `Muffle`, `Enchanting`) com temporizador `"Wait 1h"` e projeção de loop marcada como **aproximado**.
- **Mitos vs. Fatos (`/mitos`), Glossário PT↔EN (`/glossario`) e Sobre/Licenças (`/sobre`)**.
- **Progresso Portátil & PWA**: Persistência automática em `localStorage`, exportação/importação JSON e suporte offline instalável.

## Base de Dados e Validação (`/data`)

Todas as entidades foram consolidadas a partir do documento de referência e do dossiê UESP para 19 arquivos JSON em `/data/` (incluindo `dossie_mechanics.json`), cada registro contendo `source_page`, `confidence`, `confidence_tier` (`A | B | C | A/B | A/C`), `game_version_note` e `needs_verification`.

```bash
npm run validate:data
```

O comando valida os schemas com **Zod**, detecta IDs duplicados e verifica integridade referencial entre quests, locais, itens, perks e passos guiados. O script `npm run build` executa `validate:data` antes do build do Vite.

## Scripts Disponíveis

- `npm run dev` — inicia o servidor de desenvolvimento na porta `3000`.
- `npm run validate:data` — valida todos os JSONs em `/data` via Zod.
- `npm run lint` — verifica tipos TypeScript (`tsc --noEmit`).
- `npm run test` — executa a suíte de testes automatizados (`vitest run`).
- `npm run build` — valida os dados e gera o bundle de produção em `/dist`.
