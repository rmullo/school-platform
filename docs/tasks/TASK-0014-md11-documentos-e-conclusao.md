# TASK-0014 — MD-11: documentos e conclusão

- **Microentrega:** MD-11 — Documentos e conclusão.
- **Estado:** Em validação.
- **Data de criação:** 22/10/2026.
- **Origem da solicitação:** usuário autorizou implementar o restante das MDs, sem aprovação intermediária.
- **Dependências:** MD-06 concluída; acesso, pessoas, vínculos e matrícula em andamento disponíveis.
- **Requisitos relacionados:** RF-02, RF-07 e RF-08; privacidade, auditoria e armazenamento privado.

## Objetivo e limites

Implementar requisitos documentais por etapa, upload privado recuperável, substituição, validação, exceção justificada e conclusão administrativa independente de compras e pendências comerciais. Usar somente dados fictícios; não inclui publicação, dados reais ou certificação jurídica.

## Critérios de aceite

- [ ] Documentos exigidos são listados por etapa e vinculados à matrícula.
- [ ] Upload, substituição, validação e exceção justificada são auditáveis e têm acesso restrito.
- [ ] Falha de upload não perde o estado anterior nem apresenta sucesso falso.
- [ ] Conclusão administrativa não é bloqueada por livros, vendas ou material coletivo.
- [ ] API, interface e testes cobrem autorização e recuperação.

## Verificações

| Data | Cenário ou comando | Resultado observado | Evidência/limitação |
| --- | --- | --- | --- |
| 22/10/2026 | `pnpm typecheck` | Passou | API, web, contratos, banco e storage |
| 22/10/2026 | `pnpm build` | Passou | Compilação completa e bundle da tela de Operações |
| 22/10/2026 | `pnpm test` | 32 testes passaram | Inclui contratos das MD-11 a MD-15 |
| 22/10/2026 | Integração `tests/integration/operations.test.ts` | 1 teste passou | Cobre transição, relatório, RBAC e prontidão; upload MinIO não foi exercitado nessa suíte |
| 22/10/2026 | Upload/substituição/recuperação no navegador | Não executado | Requer teste manual com MinIO local |

## Alterações realizadas

Criados `DocumentRequirement`, `StudentDocument` e `EnrollmentCompletion`, endpoints de requisito, upload privado, revisão e conclusão administrativa, contrato Zod, tela Operações, armazenamento privado e auditoria. Compras não participam da conclusão.

## Roteiro de teste do usuário

- Dados fictícios: aluno, matrícula e etapa criados no ambiente local.
- Anexar documento, substituir, validar, registrar exceção e tentar acesso com perfil não autorizado.
- Confirmar que pendência comercial não bloqueia a conclusão.

## Aceite e referências

- Aceite do usuário: pendente; entrega ficará em validação.
- Publicação e dados reais: não realizados.

