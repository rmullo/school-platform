# TASK-0015 — MD-12: rematrícula e transferência

- **Microentrega:** MD-12 — Rematrícula e transferência.
- **Estado:** Em validação.
- **Data de criação:** 22/10/2026.
- **Origem da solicitação:** usuário autorizou implementar o restante das MDs, sem aprovação intermediária.
- **Dependências:** MD-08 e MD-11; cadastro reutilizável, acordos e documentos disponíveis.
- **Requisitos relacionados:** RF-05, RF-06 e RF-11.

## Objetivo e limites

Permitir renovar o cadastro do aluno no novo ano, analisar contratos/acordos e registrar transferência/notificação com liberação documental. Dívidas de irmão ou outra escola não criam bloqueio; não inclui cobrança real, integração externa ou dados reais.

## Critérios de aceite

- [ ] Rematrícula reutiliza a pessoa sem duplicar aluno ou representante.
- [ ] Contrato, acordo e situação financeira são exibidos para análise sem bloqueio indevido.
- [ ] Transferência registra data, destino informado, ciência quando existente e liberação de documentos.
- [ ] Dívida de irmão ou de outra escola não bloqueia o fluxo.
- [ ] API, interface, auditoria e testes cobrem autorização e idempotência.

## Verificações

| Data | Cenário ou comando | Resultado observado | Evidência/limitação |
| --- | --- | --- | --- |
| 22/10/2026 | `pnpm typecheck` | Passou | API, web, contratos, banco e storage |
| 22/10/2026 | `pnpm build` | Passou | Compilação completa |
| 22/10/2026 | `pnpm test` | 32 testes passaram | Contratos de transição cobertos |
| 22/10/2026 | Integração `tests/integration/operations.test.ts` | 1 teste passou | Transição idempotente e revisão financeira sem bloqueio |
| 22/10/2026 | Jornada de rematrícula com escolha de nova turma | Não executado | A interface registra a transição; escolha efetiva permanece no fluxo de matrícula |

## Alterações realizadas

Criado `EnrollmentTransition` com renovação/transferência, chave idempotente, destino, ciência, liberação de documentos e revisão financeira; API, auditoria e tela Operações foram adicionadas. A dívida de terceiro não é transformada em bloqueio.

## Roteiro de teste do usuário

- Renovar aluno fictício adimplente e aluno com acordo.
- Registrar transferência com e sem ciência e verificar documentos liberados.
- Tentar repetir a operação e confirmar que o histórico não duplica.

## Aceite e referências

- Aceite do usuário: pendente; entrega ficará em validação.
- Publicação e dados reais: não realizados.
