# Contribuindo para o Grimório do Necromante Furtivo

## Regras de Integridade dos Dados (`/data`)

1. **Fonte da verdade:** Todas as alterações de quests, feitiços, perks, itens ou locais devem refletir estritamente o guia de referência oficial (Skyrim Anniversary Edition + DLCs + Creation Club, sem mods).
2. **Sem invenção de dados:** Se um valor exato (ex.: custo de Magicka, duração em segundos, coordenadas de localização ou localização exata de um tomo) não estiver confirmado no documento, mantenha `"needs_verification": true` e `"confidence": "low"` ou `"medium"`.
3. **Metadados obrigatórios:** Todo registro deve declarar `source_page`, `confidence`, `game_version_note` e `needs_verification`.
4. **Política de ativos e mapas:** Nunca copie tiles, marcadores ou dados do MapGenie, nem incorpore texturas ou ícones proprietários do jogo.

## Fluxo de Desenvolvimento

```bash
npm install
npm run validate:data
npm run lint
npm run test
npm run build
```

Antes de abrir um Pull Request, garanta que todos os comandos acima passem sem erros.
