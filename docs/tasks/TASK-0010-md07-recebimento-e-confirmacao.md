# TASK-0010 — MD-07: recebimento inicial e confirmação

- **Microentrega:** MD-07 — Recebimento inicial e confirmação.
- **Estado:** Concluída.
- **Dependências:** MD-06 concluída; dados fictícios de pessoas, vínculos, estrutura, campanha, plano e rascunho de matrícula.
- **Autorização:** usuário solicitou “faca md 07 agora” em 22/10/2026.

## Escopo

Implementar a confirmação transacional de um rascunho de matrícula com:

- recebimento manual da parcela inicial integral ou liquidação por dispensa/negociação formal;
- registro do tipo, valor, motivo, autor e chave idempotente da liquidação;
- confirmação da matrícula, ocupação segura da vaga e auditoria na mesma transação PostgreSQL;
- geração das parcelas restantes previstas no plano, sem duplicar a parcela inicial;
- proteção contra repetição da operação e disputa pela última vaga;
- operação restrita à Direção e Secretaria para pagamento; dispensa/negociação restrita à Direção.

Ficam fora: gateway, cobrança automática, pagamento parcial ou a maior, crédito, reversão, restituição, nota fiscal, cancelamento, rematrícula e dados reais.

## Critérios de aceite

- [x] Rascunho válido exige liquidação inicial integral por pagamento, dispensa ou negociação formal.
- [x] Dispensa/negociação exige motivo e autorização da Direção; pagamento manual registra valor e método.
- [x] Confirmação, liquidação inicial, ocupação, parcelas restantes e auditoria são atômicas.
- [x] A última vaga é protegida por bloqueio transacional da turma.
- [x] A parcela inicial não é criada novamente entre as obrigações restantes.
- [x] Repetição da mesma chave de operação não duplica confirmação, liquidação, ocupação ou parcelas.
- [x] Direção e Secretaria podem confirmar pagamento; somente Direção pode dispensar/negociar; TI e anônimo são bloqueados.
- [x] Interface comunica carregamento, confirmação, erro recuperável e sucesso sem apresentar estado antigo como atual.
- [x] Testes unitários, integração PostgreSQL, jornada de interface, documentação e roteiro manual registram resultados reais.

## Alterações realizadas

Criados `Enrollment`, `InitialSettlement` e `FinancialObligation`, migração PostgreSQL, contratos de confirmação, endpoint transacional, auditoria e tela para pagamento manual ou dispensa/negociação formal. A confirmação bloqueia a turma, incrementa a ocupação e cria a parcela inicial liquidada mais as parcelas restantes abertas.

## Verificações

`pnpm generate`, `pnpm typecheck`, `pnpm build`, `pnpm test -- tests/unit/enrollment-contracts.test.ts`, `pnpm test:integration -- tests/integration/enrollment.test.ts`, `pnpm exec playwright test tests/e2e/enrollment-confirmation.spec.ts --workers=1`, `pnpm smoke` e `git diff --check` passaram. A integração reportou 6 arquivos e 28 testes aprovados; a suíte unitária filtrada reportou 5 arquivos e 21 testes aprovados. O Compose foi recriado com a migração MD-07 e volumes preservados.

## Roteiro manual

Com dados fictícios, entre como Secretaria, abra “Matrículas em andamento”, selecione um rascunho e clique em “Confirmar”. Escolha “Pagamento manual recebido”, confirme e confira o selo “Confirmada”, a ocupação incrementada e as parcelas restantes. Repita a jornada com Direção usando “Dispensa formal” ou “Negociação formal” e motivo. Não use pagamento parcial, dados reais ou operação externa.

## Limitações e retorno

Esta tarefa não autoriza MD-08, cancelamento, restituição, operação financeira real ou publicação. Pagamento parcial/a maior, crédito, reversão e restituição permanecem fora desta entrega. Aceite explícito registrado em 22/10/2026: “valide o md 07”.
