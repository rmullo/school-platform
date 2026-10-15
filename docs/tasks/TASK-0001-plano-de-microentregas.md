# TASK-0001 — Plano de microentregas e registro de trabalho

## Identificação

- Microentrega: planejamento transversal.
- Estado: Concluída.
- Data de criação: 08/10/2026.
- Origem: solicitação do usuário de um caminho com microentregas testáveis, ajustes e documentação de tarefas/alterações.
- Execução: assistente neste projeto; revisão pelo usuário.
- Referências: [especificação](../SPECIFICATION.md), [PRD](../prd.md), decisões [0001](../decisions/0001-adequacao-legal.md) e [0002](../decisions/0002-mvp-sem-kafka.md).
- Dependências: planejamento existente; não exige implementação.

## Objetivo e limites

Organizar a implementação futura em incrementos verificáveis pelo usuário, com registro contínuo de trabalho. Não iniciar código, executar operações escolares, criar issues remotas ou publicar alterações nesta tarefa.

## Critérios de aceite

- [x] Roteiro com ordem, dependências, tarefas a detalhar, teste manual e aceite por entrega.
- [x] Modelo de registro com alterações, verificações, feedback e aceite.
- [x] Documentos de orientação alinhados ao roteiro, preservando arquitetura sem Kafka e pendências legais.
- [x] Validação explícita do usuário sobre o roteiro proposto. Aprovação geral em 15/10/2026: “tudo ok no projeto. envie para o repositório remoto”.

## Trabalho realizado

Revisado [roadmap](../roadmap.md) com MD-00 a MD-15. Criados [registro](README.md), [modelo](TEMPLATE.md), esta tarefa e [CHANGELOG](../../CHANGELOG.md). Atualizados especificação, índices, instruções de colaboração e governança para manter tarefas e mudanças documentadas em cada entrega.

## Verificações

| Data | Verificação | Resultado |
| --- | --- | --- |
| 08/10/2026 | Links locais e âncoras nos documentos | 184 referências conferidas, sem erros |
| 08/10/2026 | IDs e quantidade das microentregas | MD-00 a MD-15 presentes, sem duplicidade |
| 08/10/2026 | Conteúdo versionável e consistência do fluxo | Somente documentação/organização; etapas planejadas e tarefa em validação; sem aceite presumido |
| 08/10/2026 | Verificação de formatação das alterações pelo Git | Sem erros |

Não foram executados testes de aplicação; a implementação permanece pausada.

## Roteiro de teste do usuário

1. Abrir o roadmap e conferir se as entregas seguem a ordem desejada para o atendimento da escola.
2. Escolher um cenário, como pagamento parcial ou cancelamento com antecipação, e localizar sua entrega e resultado esperado.
3. Conferir se cada entrega tem uma demonstração concreta e pequena; indicar divisões ou mudanças de prioridade.
4. Revisar o modelo de tarefa e confirmar se o registro de testes/ajustes atende ao acompanhamento desejado.

Versão: revisão documental posterior ao commit `e57c25b`; consultar o histórico Git deste arquivo. Todos os marcos de implementação estão planejados, não concluídos.

## Feedback e ajustes

Em 08/10/2026, o usuário solicitou “faça o MD-00”. A execução dessa microentrega está na [TASK-0002](TASK-0002-md00-regras-e-exemplos.md). Essa escolha autoriza a etapa, sem presumir aceite integral do roteiro ou início das demais.

## Registro de alterações

| Data | Alteração | Motivo |
| --- | --- | --- |
| 08/10/2026 | Plano MD-00 a MD-15 e rotina de documentação | Permitir testes e ajustes pelo usuário em incrementos pequenos |

## Aceite e referências

- Aceite: confirmado em 15/10/2026 pela aprovação geral do projeto. A execução das próximas microentregas permanece dependente de orientação.
- Commit e envio ao GitHub solicitados pelo usuário em 08/10/2026, junto à MD-00. Conferir versão e publicação no histórico Git; pedido de publicação não equivale ao aceite funcional.
- Próxima ação: aguardar orientação sobre a próxima microentrega; o aceite geral não autoriza executar todas as etapas.
