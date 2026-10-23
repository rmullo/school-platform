# MD-10 — Cancelamento e restituição

Estado: Concluída com aceite explícito do usuário em 22/10/2026: “validada”.

## Entrega

A etapa permite cancelar uma matrícula com data efetiva e motivo, liberar a vaga uma única vez, marcar obrigações futuras como canceladas sem apagar recebimentos e apurar valores pagos no período futuro mais créditos disponíveis. A restituição efetiva é registrada em entidade própria, com valor, método manual, responsável, motivo, data e chave de operação; ela não reutiliza a reversão de recebimento.

O servidor restringe cancelamento e restituição à Direção, impede novos recebimentos, negociações, destinações e reversões após o cancelamento e mantém as operações transacionais no PostgreSQL. Inadimplência isolada não dispara cancelamento automático.

## Verificações realizadas

- `pnpm generate`, `pnpm typecheck` e `pnpm build`: passaram.
- `pnpm test`: 28 testes unitários passaram.
- `pnpm exec vitest run --config vitest.integration.config.ts tests/integration/cancellation.test.ts --reporter=verbose`: 1 teste PostgreSQL/Testcontainers passou.
- Regressão `tests/integration/negotiation.test.ts`: 1 teste passou, preservando a MD-09.
- `pnpm exec playwright test tests/e2e/enrollment-confirmation.spec.ts --workers=1`: 1 jornada passou, incluindo cancelamento e restituição.
- Migração `202610220008_cancellation_and_refunds` aplicada com `pnpm db:migrate`.
- `pnpm infra:up` reconstruiu a pilha local preservando volumes.
- `git diff --check` passou e a análise dos arquivos alterados não encontrou erros.

## Teste manual

1. Entre como Diretor e abra “Matrículas em andamento”.
2. Use uma matrícula fictícia confirmada com recebimento inicial e, se necessário, crédito.
3. Selecione “Cancelar matrícula”, informe data efetiva e motivo e confirme.
4. Confira a vaga liberada, as obrigações futuras canceladas e o valor apurado.
5. Se houver valor positivo, selecione “Registrar restituição” e registre a devolução manual pelo valor apurado.
6. Repita a operação com a mesma chave apenas por API/teste automatizado e confirme que não há duplicidade.

Resultado esperado: o histórico de recebimentos permanece, a vaga é liberada uma única vez, não surgem novas cobranças e a restituição é distinguida da reversão.

## Limitações

Gateway, integração bancária, nota fiscal, operação financeira real, dados reais, política jurídica definitiva de retenção/restituição e MD-11 permanecem fora.
