# TASK-0009 — MD-06: matrícula em andamento

- **Microentrega:** MD-06 — Matrícula em andamento.
- **Estado:** Concluída.
- **Dependências:** MD-04 e MD-05 aceitas; dados fictícios de pessoas, vínculos, estrutura, campanha e plano.
- **Autorização:** usuário solicitou “faca o md 06 agora” em 22/10/2026.

## Escopo

Implementar o rascunho administrativo de matrícula com:

- seleção de aluno, turma ofertada, campanha e versão de plano;
- conferência de responsável financeiro já vinculado ao aluno;
- conferência de vínculo entre campanha, ano letivo, turma e plano;
- snapshot da parcela inicial do plano, sem duplicação de rascunho para a mesma combinação;
- lista de pendências administrativas editável;
- estado explicitamente `DRAFT`, sem ocupação de vaga, confirmação, pagamento ou geração das demais mensalidades;
- auditoria e edição com controle de versão, restrita à Direção e Secretaria.

Ficam fora: confirmação de matrícula, reserva/ocupação de vaga, cobrança, pagamento, geração das parcelas restantes, aceite contratual, documentos reais e dados reais.

## Critérios de aceite

- [x] Rascunho exige aluno, turma, campanha, plano e responsável financeiro válido.
- [x] Servidor rejeita campanha/plano/turma de anos ou campanhas incompatíveis.
- [x] Servidor rejeita turma sem oferta na campanha ou sem capacidade disponível no momento da conferência.
- [x] Criação não altera `Classroom.occupied` e não apresenta o rascunho como matrícula confirmada.
- [x] Parcela inicial é armazenada como snapshot do rascunho; as demais mensalidades não são criadas.
- [x] Repetição da mesma combinação não duplica o rascunho.
- [x] Direção e Secretaria podem consultar/criar/corrigir; TI e anônimo são bloqueados pela API.
- [x] Interface possui estados de carregamento, vazio, erro, envio e sucesso, com layout responsivo e controles acessíveis.
- [x] Testes, documentação, limitações e roteiro manual registram resultados reais.

## Alterações realizadas

Criados `EnrollmentDraft`, migração PostgreSQL, contratos Zod, serviço/controlador NestJS, auditoria, tela React/MUI para salvar/retomar e rotas protegidas para Direção/Secretaria. A vaga continua apenas consultada; o valor inicial é copiado do plano no momento do salvamento.

## Verificações

`pnpm generate`, `pnpm typecheck`, `pnpm build`, `pnpm test -- tests/unit/enrollment-contracts.test.ts` e `pnpm test:integration -- tests/integration/enrollment.test.ts` passaram. A integração reportou 6 arquivos e 28 testes aprovados; a suíte unitária filtrada reportou 5 arquivos e 20 testes aprovados. E2E específico e smoke da MD-06 não foram executados nesta entrega.

## Roteiro manual

Com dados fictícios, entre como Direção ou Secretaria, abra “Matrículas em andamento”, selecione aluno com responsável financeiro, campanha, turma ofertada e plano, informe pendências e salve. Confira “Rascunho”, a parcela inicial e a ocupação `0/capacidade`; atualize, use “Retomar” e salve novamente. Repita a mesma combinação para conferir a duplicidade. Não use dados reais.

## Limitações e retorno

Esta tarefa não autoriza matrícula confirmada, cobrança, pagamento, publicação ou uso de dados reais. Aceite explícito registrado em 22/10/2026: “md 06 validado”.
