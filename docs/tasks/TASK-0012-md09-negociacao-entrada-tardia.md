# TASK-0012 — MD-09: negociação e entrada tardia

- **Microentrega:** MD-09 — Negociação e entrada tardia.
- **Estado:** Concluída.
- **Dependências:** MD-08 concluída; matrícula confirmada, obrigações e recebimentos fictícios disponíveis.
- **Autorização:** usuário solicitou “faça md 09” em 22/10/2026.

## Escopo

Implementar, de forma transacional e auditável:

- negociação formal da primeira obrigação restante, com autorização do Diretor;
- preservação do valor original, motivo, novo vencimento/valor e responsável pela autorização;
- registro de entrada tardia sem criar competências anteriores nem duplicar obrigações;
- regularização da primeira parcela aplicável da entrada tardia;
- idempotência por chave de operação, RBAC e histórico de alterações.

Ficam fora: cancelamento, restituição efetiva, gateway, nota fiscal, descontos automáticos, rematrícula, transferência, dados reais e MD-10.

## Critérios de aceite

- [x] Apenas Diretor autoriza negociação; Secretaria pode consultar a matrícula e recebe bloqueio ao tentar negociar.
- [x] Negociação exige motivo, preserva original e registra valor/vencimento negociados.
- [x] Não há competência anterior criada ou cobrada pela entrada tardia.
- [x] Entrada tardia calcula somente as obrigações futuras do período válido, sem duplicidade.
- [x] Operações concorrentes e repetição da chave não duplicam obrigação ou recebimento.
- [x] Auditoria registra autorização, aplicação, autor, matrícula e motivo.
- [x] API e UI comunicam validações, erro, envio, sucesso e recuperação em desktop e móvel.
- [x] Testes unitários, PostgreSQL/Testcontainers e Playwright cobrem regras e jornada.

## Alterações realizadas

Banco: campos de entrada tardia em `EnrollmentDraft` e `FinancialNegotiation` com valor/vencimento originais, negociados, motivo, autor e chave de operação. API: cálculo transacional das competências do mês de ingresso até dezembro e negociação exclusiva da Direção. Web: campo de mês de ingresso e diálogo de negociação com feedback. Documentação: guia, roadmap, índice, módulos, cadastros e changelog.

## Verificações

`pnpm generate`, `pnpm typecheck`, `pnpm build`: passaram. `pnpm test -- tests/unit/enrollment-contracts.test.ts`: 26 testes passaram. `pnpm test:integration -- tests/integration/negotiation.test.ts`: 30 testes passaram no conjunto de integração executado. `pnpm exec playwright test tests/e2e/enrollment-confirmation.spec.ts --workers=1`: 1 teste passou. As migrações foram aplicadas com `pnpm db:migrate` e a pilha foi reconstruída com `pnpm infra:up`, preservando volumes. `git diff --check` passou. A análise dos arquivos alterados não encontrou erros.

## Roteiro manual

Usar matrícula fictícia com obrigação futura: informar agosto no rascunho, confirmar e verificar competências de agosto a dezembro; depois autorizar uma negociação como Diretor, conferir original e negociado, repetir a operação e confirmar que não existem competências anteriores.

## Limitações e retorno

Aceite explícito do usuário registrado em 22/10/2026: “validada”. Esta tarefa não autoriza MD-10, cancelamento, restituição efetiva, operação financeira real ou publicação.
