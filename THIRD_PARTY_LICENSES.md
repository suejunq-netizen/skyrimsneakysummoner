# Licenças de Terceiros e Ativos (THIRD_PARTY_LICENSES)

Este projeto utiliza exclusivamente bibliotecas de código aberto com licenças permissivas e ativos originais ou de licença aberta. Nenhum ativo proprietário extraído de *The Elder Scrolls V: Skyrim* ou tiles/dados raspados do MapGenie é incluído.

## Dependências de Produção & Desenvolvimento

| Pacote / Recurso | Versão / Fonte | Licença | Finalidade |
| --- | --- | --- | --- |
| `react`, `react-dom` | ^19.0.1 | MIT | Interface de usuário |
| `react-router-dom` | ^7.18.6 | MIT | Roteamento SPA |
| `zustand` | ^5.1.0 | MIT | Estado global e persistência em `localStorage` |
| `zod` | ^4.6.7 | MIT | Validação estrita dos schemas de `/data/*.json` |
| `fuse.js` | ^7.5.0 | Apache-2.0 | Busca fuzzy local |
| `recharts` | ^3.11.0 | MIT | Gráfico de composição do exército por fase |
| `leaflet` | ^1.9.4 | BSD-2-Clause | Motor de mapa `CRS.Simple` |
| `leaflet.markercluster` | ^1.5.3 | MIT | Agrupamento de marcadores no mapa |
| `lucide-react` | ^0.546.0 | ISC | Iconografia vetorial |
| `motion` | ^12.23.24 | MIT | Transições sutis com suporte a `prefers-reduced-motion` |
| `i18next`, `react-i18next` | ^27.2.3 / ^18.0.3 | MIT | Internacionalização (`pt-BR` e `en`) |
| `tailwindcss`, `@tailwindcss/vite` | ^4.3.3 | MIT | Estilização e variáveis de tema |
| `vite`, `@vitejs/plugin-react` | ^8.3.8 / ^6.1.1 | MIT | Empacotamento e servidor de desenvolvimento |
| `vite-plugin-pwa` | ^2.0.0 | MIT | Suporte offline e manifesto PWA |
| `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` | ^5.1.1 / ^16.3.3 | MIT | Testes unitários e de UI |
| `@playwright/test` | ^1.65.1 | Apache-2.0 | Testes E2E em navegador real (desktop e mobile) |
| `@axe-core/playwright` | ^4.14.0 | MPL-2.0 | Auditoria automatizada de acessibilidade e contraste |
| `typescript`, `tsx` | ^6.0.3 / ^4.21.0 | Apache-2.0 / MIT | Checagem de tipos e execução do validador |
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals` | ^10.15.0 / ^8.73.0 | MIT | Análise estática e regras React Hooks |
| `prettier` | ^3.10.1 | MIT | Padronização de formatação de código |
| `esbuild`, `autoprefixer` | ^0.28.2 / ^10.4.21 | MIT | Ferramentas de build e CSS |

## Fontes e Ativos Visuais

- **Cinzel, EB Garamond, JetBrains Mono** (Google Fonts) — **SIL Open Font License 1.1 (OFL)**.
- **`/public/assets/skyrim-stylized-map.svg`** — Cartografia estilizada original criada para o projeto (**MIT / CC0**).
- **`/public/icon.svg` e ícones PWA PNG derivados** — Emblema original do Grimório (**MIT / CC0**).

## Referências Externas (Links em Nova Aba)

- **UESP (Unofficial Elder Scrolls Pages)** — Conteúdo externo referenciado apenas por link em nova aba; licenciado pela comunidade sob **CC BY-SA 2.5**.
- **MapGenie** — Links externos opcionais abrem diretamente em nova aba; nenhum tile, marcador ou HTML é raspado ou embutido.

## Aviso Legal

Projeto independente de fã, sem fins comerciais, não afiliado à Bethesda Softworks ou ZeniMax Media.
