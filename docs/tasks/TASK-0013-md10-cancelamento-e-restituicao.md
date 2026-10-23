# TASK-0013 — MD-10: cancelamento e restituição

- **Microentrega:** MD-10 — Cancelamento e restituição.
- **Estado:** Concluída.
- **Dependências:** MD-08 e MD-09 concluídas; matrícula confirmada, obrigações, recebimentos, créditos e negociações fictícios disponíveis.
- **Autorização:** usuário solicitou “faça o md 10” em 22/10/2026.

## Escopo

Implementar, de forma transacional e auditável:

- cancelamento da matrícula com data efetiva e motivo;
- encerramento das obrigações futuras sem cancelar silenciosamente valores já liquidados;
- liberação segura da vaga ocupada;
- apuração de saldo, crédito ou valor de restituição conforme os recebimentos fictícios registrados;
- restituição efetiva registrada separadamente de reversão de erro;
- idempotência, RBAC, auditoria e proteção contra cancelamento por mera inadimplência.

Ficam fora: gateway, integração bancária, nota fiscal, operação financeira real, dados reais, publicação e MD-11.

## Critérios de aceite

- [x] Cancelamento exige motivo, data efetiva válida e autorização da Direção no servidor.
- [x] Cancelamento preserva o histórico e ajusta somente obrigações futuras aplicáveis.
- [x] A vaga é liberada uma única vez e a matrícula não pode ser cancelada novamente.
- [x] Saldos pagos, créditos e restituição são calculados em centavos e sem duplicidade.
- [x] Restituição efetiva usa registro próprio, responsável, data, valor, motivo e chave; não é reversão.
- [x] Inadimplência isolada não dispara cancelamento automático.
- [x] Repetição da chave não duplica cancelamento, liberação ou restituição.
- [x] Auditoria registra matrícula, autor, motivo, data efetiva, valores e resultado.
- [x] API e UI comunicam validações, confirmação, envio, sucesso, erro e recuperação em desktop e móvel.
- [x] Testes unitários, PostgreSQL/Testcontainers e Playwright cobrem as regras e jornadas críticas.

## Alterações realizadas

Banco: estados `CANCELLED` para matrícula/obrigações, `EnrollmentCancellation` e `FinancialRefund`, com chaves de operação e restrições. Contratos: entradas e resumo de cancelamento/restituição. API: cancelamento e restituição transacionais, cálculo de valores futuros/créditos, RBAC e bloqueio de efeitos após cancelamento. Web: diálogos de cancelamento e restituição, estados e mensagens. Documentação: guia, roadmap, índice, módulos, cadastros e changelog.

## Verificações

`pnpm generate`, `pnpm typecheck`, `pnpm build` e `pnpm test`: passaram; 28 testes unitários. `pnpm exec vitest run --config vitest.integration.config.ts tests/integration/cancellation.test.ts --reporter=verbose`: 1 teste passou com PostgreSQL/Testcontainers. A regressão `tests/integration/negotiation.test.ts` também passou com 1 teste. `pnpm exec playwright test tests/e2e/enrollment-confirmation.spec.ts --workers=1`: 1 teste passou. `pnpm db:migrate` aplicou a migração 008; `pnpm infra:up` reconstruiu a pilha preservando volumes. `git diff --check` passou e a análise dos arquivos alterados não encontrou erros. Não houve CI, publicação ou dados reais.

## Roteiro manual

Usar matrícula e recebimentos fictícios: cancelar antes e depois do início das aulas, conferir vaga, obrigações futuras, saldo e histórico; registrar uma restituição efetiva fictícia e repetir a chave de operação.

## Limitações e retorno

Aceite explícito do usuário registrado em 22/10/2026: “validada”. Gateway, integração bancária, nota fiscal, operação financeira real, dados reais e MD-11 permanecem fora.
