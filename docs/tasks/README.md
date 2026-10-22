# Registro de tarefas

Criado em 08/10/2026 para acompanhar as [microentregas](../roadmap.md), os testes do usuário e os ajustes. Este registro é local ao repositório; não pressupõe criação de issues no GitHub.

## Convenções

- Um arquivo `TASK-NNNN-titulo.md` por tarefa concreta, usando o [modelo](TEMPLATE.md).
- Atribuir o próximo número livre, sem reutilizar IDs de tarefas canceladas. Vincular à microentrega, requisitos e dependências.
- Abrir tarefas da entrega selecionada antes da execução. Registrar também correções e alterações apenas documentais, agrupando pequenos ajustes relacionados na mesma tarefa.
- Usar dados fictícios nas evidências públicas. Não versionar documentos preenchidos, credenciais ou dados de alunos/responsáveis.
- Manter este índice e o estado dentro do arquivo coerentes. Nunca preencher evidência, data de aceite, commit ou resultado ainda inexistente.

## Estados

| Estado | Significado |
| --- | --- |
| Planejada | Escopo e aceite definidos, execução não iniciada |
| Em andamento | Trabalho efetivamente iniciado |
| Bloqueada | Dependência concreta impede a tarefa; registrar motivo e o que a libera |
| Em validação | Entrega e verificações do autor registradas; aguarda teste/retorno do usuário |
| Em ajuste | Retorno do usuário ou falha exige correção |
| Concluída | Critérios atendidos e aceite explícito registrado com evidência |
| Cancelada | Trabalho encerrado sem entrega; preservar motivo e eventual substituta |

Silêncio não é aceite. Um commit ou teste automatizado bem-sucedido também não substitui validação do usuário. Aprovação da microentrega pode abranger suas tarefas quando o escopo aprovado estiver explícito.

## Índice

| ID | Microentrega | Tarefa | Estado | Referência de versão |
| --- | --- | --- | --- | --- |
| TASK-0001 | Planejamento transversal | [Plano de microentregas e registro de trabalho](TASK-0001-plano-de-microentregas.md) | Concluída | Aceite em 15/10/2026; consultar histórico Git |
| TASK-0002 | MD-00 | [Regras, exemplos e fluxo de matrícula](TASK-0002-md00-regras-e-exemplos.md) | Concluída | Aceite documental em 13/10/2026; consultar histórico Git |
| TASK-0003 | MD-01 | [Fundação executável](TASK-0003-md01-fundacao.md) | Concluída | Aceite em 15/10/2026; consultar histórico Git |
| TASK-0004 | Qualidade transversal | [Skill e diretrizes de desenvolvimento](TASK-0004-skill-e-diretrizes-de-desenvolvimento.md) | Concluída | Aceite em 15/10/2026; consultar histórico Git |
| TASK-0005 | MD-02 | [Acesso e auditoria básica](TASK-0005-md02-acesso-e-auditoria.md) | Concluída | Aceite explícito em 21/10/2026 |
| TASK-0006 | MD-03 | [Estrutura escolar](TASK-0006-md03-estrutura-escolar.md) | Concluída | Aceite explícito em 22/10/2026 |

## Procedimento de encerramento

Documentar o que mudou e por quê, arquivos afetados, verificações com resultado, limitações e roteiro de teste manual. Registrar feedback, ajustes e aceite sem apagar observações anteriores. Atualizar os documentos afetados e o [CHANGELOG](../../CHANGELOG.md). Referenciar commit/PR quando existirem; não alterar o estado para concluído antes do aceite.

As mudanças anteriores à adoção deste registro estão nos commits, nas decisões e no histórico documental. Não criar retrospectivamente tarefas ou aprovações fictícias.
