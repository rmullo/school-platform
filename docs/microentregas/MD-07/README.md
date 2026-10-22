# MD-07 — Recebimento inicial e confirmação

**Estado:** Concluída com aceite explícito do usuário em 22/10/2026: “valide o md 07”.

A [TASK-0010](../../tasks/TASK-0010-md07-recebimento-e-confirmacao.md) implementa o recebimento manual integral da parcela inicial ou a liquidação por dispensa/negociação formal, seguida da confirmação da matrícula.

A confirmação ocorre em uma transação PostgreSQL: liquidação inicial, matrícula, ocupação da turma, obrigações restantes e auditoria são persistidas conjuntamente. A parcela inicial não é duplicada. A chave de operação torna a repetição idempotente e o bloqueio da turma protege a última vaga.

Pagamento parcial ou a maior, crédito, reversão, restituição, cancelamento, gateway e dados reais permanecem fora da MD-07. Verificações, roteiro e limitações estão na [TASK-0010](../../tasks/TASK-0010-md07-recebimento-e-confirmacao.md). MD-08 não foi iniciada nem autorizada.
