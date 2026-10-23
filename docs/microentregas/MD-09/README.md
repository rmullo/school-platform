# MD-09 — Negociação e entrada tardia

Estado: Concluída com aceite explícito do usuário em 22/10/2026: “validada”.

## Entrega

A etapa permite registrar entrada tardia no rascunho informando o mês de ingresso. O servidor calcula somente as competências desse mês até dezembro, sem criar competências anteriores e sem duplicar a parcela inicial. Também permite negociar a primeira obrigação restante, exclusivamente pela Direção, preservando valor, vencimento e motivo originais.

## Verificações realizadas

- `pnpm generate`, `pnpm typecheck` e `pnpm build`: passaram.
- Testes unitários: 26 passaram.
- Integração PostgreSQL/Testcontainers: 30 testes passaram no conjunto executado, incluindo entrada em agosto, cinco competências, bloqueio da Secretaria, negociação pela Direção e idempotência.
- Playwright específico: 1 teste passou, incluindo confirmação, acesso da Direção, diálogo de negociação e layout móvel.
- Migrações `202610220006_receipts_and_credits` e `202610220007_negotiations_and_late_entry` aplicadas no ambiente local sem remoção de volumes.

## Teste manual

1. Entre como Secretaria e abra “Matrículas em andamento”.
2. Crie um rascunho fictício e informe o mês de ingresso tardio, por exemplo agosto.
3. Confirme a matrícula e confira que existem somente as competências de agosto a dezembro, sem meses anteriores.
4. Entre como Diretor, abra a matrícula confirmada e selecione “Negociar parcela”.
5. Informe novo valor, vencimento e motivo; confirme o registro.
6. Confira que o valor original continua no histórico e que a obrigação passou a usar o valor/vencimento negociados.

Resultado esperado: a entrada tardia não cria cobrança anterior, a negociação exige Direção, a obrigação não é duplicada e a operação repetida pela mesma chave não produz novo efeito.

## Limitações

O ingresso após o dia 10 e proporcionalidade por dias continuam pendentes. Descontos automáticos, cancelamento, restituição efetiva, gateway, nota fiscal, rematrícula, transferência e dados reais permanecem fora. A MD-10 continua não autorizada.
