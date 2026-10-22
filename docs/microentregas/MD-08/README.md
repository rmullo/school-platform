# MD-08 — Recebimentos e correções

Estado: Concluída em 22/10/2026, após aceite explícito do usuário (“md 08 validado”).

## Entrega

A etapa registra recebimentos manuais em centavos, aloca valores em obrigações, cria crédito para excedentes, permite destinação posterior, emite recibo interno e reverte lançamentos incorretos com motivo. As operações são idempotentes, auditadas e transacionais no PostgreSQL.

## Verificações realizadas

- `pnpm generate`, `pnpm typecheck` e `pnpm build`: passaram.
- Testes unitários: 24 passaram.
- Integração PostgreSQL/Testcontainers: 29 passaram, incluindo parcial, excedente, crédito, destinação, reversão e bloqueio de reversão após destinação.
- Playwright: 15 passaram na suíte E2E disponível.
- A suíte foi executada com dados fictícios; não houve gateway, nota fiscal, restituição efetiva, cancelamento ou dados reais.

## Teste manual

1. Entre com Diretor ou Secretaria e abra “Matrículas em andamento”.
2. Use uma matrícula confirmada fictícia e selecione “Receber pagamento”.
3. Registre valor recebido menor que o saldo e aloque-o em uma obrigação.
4. Registre outro valor maior que a alocação; confira o crédito disponível e o recibo interno.
5. Selecione “Destinar crédito”, escolha outra obrigação e confirme a destinação.
6. Para um recebimento ainda não destinado, use “Reverter”, informe um motivo com pelo menos cinco caracteres e confira os saldos recompostos.

Resultado esperado: nenhum lançamento é duplicado ao repetir a mesma operação; créditos não são destinados acima do saldo; o recibo é identificado como interno e não como documento fiscal.

## Limitações

Gateway, conciliação bancária, emissão fiscal, restituição efetiva, cancelamento e entrada tardia continuam fora da MD-08. A conclusão não autoriza MD-09 nem uso financeiro real.
