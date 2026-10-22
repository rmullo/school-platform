# MD-06 — Matrícula em andamento

**Estado:** Concluída com aceite explícito do usuário em 22/10/2026: “md 06 validado”.

A [TASK-0009](../../tasks/TASK-0009-md06-matricula-em-andamento.md) implementa o rascunho administrativo de matrícula: aluno, responsável financeiro vinculado, campanha, turma ofertada, plano, pendências e snapshot da parcela inicial.

O rascunho pode ser salvo e retomado por Direção ou Secretaria. A API valida as relações e a capacidade disponível, registra auditoria e impede duplicidade. A criação não ocupa vaga, não confirma matrícula, não registra pagamento e não gera as mensalidades restantes.

Verificações reais, roteiro manual e limitações estão na [TASK-0009](../../tasks/TASK-0009-md06-matricula-em-andamento.md). MD-07 não foi iniciada nem autorizada.
