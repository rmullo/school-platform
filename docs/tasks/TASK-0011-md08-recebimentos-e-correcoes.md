# TASK-0011 — MD-08: recebimentos e correções

- **Microentrega:** MD-08 — Recebimentos e correções.
- **Estado:** Concluída.
- **Dependências:** MD-07 concluída; matrícula confirmada e obrigações fictícias disponíveis.
- **Autorização:** usuário solicitou “faca agora a md 08” em 22/10/2026.
- **Aceite:** usuário confirmou “md 08 validado” em 22/10/2026.

## Escopo

Implementar recebimentos internos com:

- pagamento integral, parcial ou a maior em valores inteiros de centavos;
- alocação do pagamento em uma ou mais obrigações da matrícula;
- criação de crédito quando houver valor não alocado e destinação posterior do crédito;
- recibo interno sem simular documento fiscal;
- reversão de lançamento incorreto com motivo, preservando histórico;
- idempotência por chave de operação, auditoria e atualização transacional dos saldos.

Ficam fora: gateway, conciliação bancária, nota fiscal, restituição efetiva, cancelamento, negociação de entrada tardia, dados reais e MD-09.

## Critérios de aceite

- [x] Pagamento positivo aceita valor integral, parcial ou superior ao saldo, sem usar ponto flutuante.
- [x] Alocação não excede saldo da obrigação e atualiza estado/saldo atomicamente.
- [x] Excedente gera crédito disponível vinculado ao contratante/matrícula.
- [x] Crédito só pode ser destinado uma vez e não excede saldo disponível da obrigação.
- [x] Recibo interno identifica operação, valor, matrícula, autor e data, sem se apresentar como nota fiscal.
- [x] Reversão exige motivo, preserva o pagamento original e recompõe saldos/crédito sem duplicar efeitos.
- [x] Repetição da chave de operação não duplica recebimento, alocação ou crédito.
- [x] Direção e Secretaria podem receber/reverter; TI e anônimo são bloqueados pela API.
- [x] Interface comunica estados de carregamento, vazio, erro, envio e sucesso em desktop e móvel.
- [x] Testes unitários, integração PostgreSQL, jornada Playwright, documentação e roteiro manual registram resultados reais.

## Alterações realizadas

Banco: `PARTIAL`, `PaymentReceipt`, `PaymentAllocation`, `FinancialCredit` e `CreditAllocation`, com restrições e índices transacionais. API: recebimento manual, alocação, crédito, destinação, reversão, idempotência e auditoria. Web: diálogos para receber, destinar crédito e reverter, com estados de erro/sucesso. Documentação: MD-08, roadmap, índice, dicionário, módulos e changelog.

## Verificações

`pnpm generate`, `pnpm typecheck`, `pnpm build`: passaram. `pnpm test -- tests/unit/enrollment-contracts.test.ts`: 24 testes passaram. `pnpm test:integration -- tests/integration/receipts.test.ts`: 29 testes passaram na execução da configuração de integração. `pnpm test:e2e -- tests/e2e/enrollment-confirmation.spec.ts`: a configuração executou a suíte E2E disponível, com 15 testes passando. `git diff --check`: passou. A análise de problemas nos arquivos alterados não encontrou erros.

## Roteiro manual

Usar apenas matrícula fictícia confirmada: registrar pagamento parcial, registrar pagamento a maior, conferir recibo interno e crédito, destinar crédito em outra obrigação e reverter um lançamento não destinado com motivo.

## Limitações e retorno

Esta tarefa não autoriza MD-09, restituição efetiva, gateway, emissão fiscal, operação financeira real ou publicação. A tarefa foi concluída após o aceite explícito; novas alterações ou a MD-09 exigem orientação própria.
