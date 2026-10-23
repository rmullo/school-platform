# TASK-0018 — MD-15: preparação e piloto

- **Microentrega:** MD-15 — Preparação e piloto.
- **Estado:** Em validação.
- **Data de criação:** 22/10/2026.
- **Origem da solicitação:** usuário autorizou implementar o restante das MDs, sem aprovação intermediária.
- **Dependências:** MD-11 a MD-14 e verificações da jornada completa.
- **Requisitos relacionados:** RF-08 a RF-13, privacidade, retenção, acessibilidade, observabilidade e continuidade.

## Objetivo e limites

Consolidar checklist de prontidão, health/readiness, revisão de acesso, retenção, canais, fornecedores, procedimento fiscal, backup/restauração e roteiro de jornada. O aplicativo não será publicado, não receberá dados reais e não iniciará piloto real sem decisão expressa posterior.

## Critérios de aceite

- [ ] Checklist registra responsáveis, evidência, bloqueio e situação sem inventar conformidade.
- [ ] Backup/restauração de ambiente fictício e observabilidade são verificáveis localmente.
- [ ] Jornada completa e acessibilidade têm roteiro reproduzível.
- [ ] Pendências impeditivas ficam visíveis; piloto real permanece bloqueado sem aprovação específica.

## Verificações

| Data | Cenário ou comando | Resultado observado | Evidência/limitação |
| --- | --- | --- | --- |
| 22/10/2026 | `pnpm typecheck` | Passou | API, web, contratos, banco e storage |
| 22/10/2026 | `pnpm build` | Passou | Compilação completa |
| 22/10/2026 | `pnpm test` | 32 testes passaram | Contratos e regras de acesso cobertos |
| 22/10/2026 | Integração `tests/integration/operations.test.ts` | 1 teste passou | Prontidão e restrição de relatório verificadas |
| 22/10/2026 | Backup/restauração, auditoria de acessibilidade e piloto | Não executado | Permanecem atividades operacionais antes de produção |

## Alterações realizadas

Incluído painel de prontidão local para Direção/TI, com status do banco/storage, contas, documentos e bloqueio explícito de dados reais/produção. Swagger foi atualizado para o escopo MD-15; não houve publicação ou piloto.

## Roteiro de teste do usuário

- Executar o checklist com dados fictícios, conferir saúde dos serviços e restaurar uma cópia local de teste.
- Repetir jornada completa e revisar permissões, acessibilidade, logs e pendências.
- Não inserir dados reais nem publicar/pilotar.

## Aceite e referências

- Aceite do usuário: pendente; entrega ficará em validação.
- Publicação, piloto real e dados reais: não realizados.
