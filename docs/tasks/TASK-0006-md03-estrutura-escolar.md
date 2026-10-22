# TASK-0006 — MD-03: estrutura escolar

## Identificação

- Microentrega: MD-03.
- Estado: Planejada.
- Data de criação: 21/10/2026.
- Origem da solicitação: usuário aprovou a MD-02 e solicitou avançar para a MD-03.
- Requisitos/decisões relacionados: RF-09, RF-11 e critérios de estrutura escolar da especificação vigente.
- Dependências: MD-02 concluída; somente dados fictícios na demonstração.

## Objetivo e limites

Implementar o cadastro e a consulta da estrutura necessária para organizar oferta escolar: ano letivo, etapa, série, turma, capacidade máxima e referência à autorização da etapa.

Inclui relacionamentos consistentes, validação de campos, ativação controlada da oferta e edição de capacidade sem ficar abaixo da ocupação existente. Inclui autorização no servidor para as operações administrativas e auditoria das alterações relevantes.

Ficam fora desta tarefa: alunos e responsáveis (MD-04), campanhas/contratos (MD-05), matrícula, regras financeiras, critérios etários detalhados ainda não definidos, importação de atos reais, publicação e uso de dados reais.

## Critérios de aceite

- [ ] Diretor cria, consulta e edita ano letivo, etapa, série e turma com relacionamentos válidos.
- [ ] Turma possui capacidade máxima positiva e a API impede capacidade inferior à ocupação registrada.
- [ ] A etapa referencia órgão, ato, validade e evidência da autorização sem presumir que o cadastro seja uma autorização real.
- [ ] Oferta não é ativada sem referência de autorização válida para a demonstração; valores reais não são inventados.
- [ ] Secretaria e TI não recebem operações administrativas não previstas na matriz da MD-02.
- [ ] Alterações importantes ficam auditadas, sem expor dados desnecessários.
- [ ] API valida e autoriza as operações independentemente da interface.
- [ ] Banco, API, contratos e interface têm testes proporcionais; a jornada principal é verificável por navegador.
- [ ] Documentação afetada, roteiro manual, limitações e resultados reais são atualizados.
- [ ] Aceite explícito do usuário é registrado antes de encerrar a tarefa.

## Decisões e pendências

- Os atos e órgãos usados nos testes serão fictícios e claramente identificados; nenhum valor real será inferido dos documentos.
- Os campos de autorização serão armazenados como referência administrativa, não como prova jurídica suficiente para uso real.
- Critérios etários, exceções, escrituração e capacidade efetivamente autorizada dependem de definição normativa/operacional posterior; não serão inventados nesta tarefa.
- A operação de ativar oferta será separada do simples cadastro para evitar que registros incompletos apareçam como oferta disponível.

## Trabalho realizado

Tarefa aberta para detalhamento e implementação. Nenhum código da MD-03 foi alterado nesta abertura.

## Verificações

| Data | Cenário ou comando | Resultado observado | Evidência/limitação |
| --- | --- | --- | --- |
| 21/10/2026 | Revisão do roadmap, especificação, PRD, cadastros e módulos | Escopo e dependências conferidos | Nenhuma validação funcional da MD-03 executada ainda |

## Roteiro de teste do usuário

- Versão/commit ou identificação da entrega: a definir após implementação.
- Preparação e dados fictícios: criar um ano, uma etapa com autorização fictícia, uma série e uma turma.
- Passos e resultado esperado: criar e consultar a estrutura; ativar uma oferta com referência fictícia; tentar capacidade inválida; tentar reduzir capacidade abaixo da ocupação; repetir ações com Secretaria e TI.
- Limitações conhecidas: não representa autorização escolar real nem cria alunos ou matrículas.

## Feedback e ajustes

| Data | Retorno do usuário | Ação tomada ou tarefa vinculada | Situação |
| --- | --- | --- | --- |
| 21/10/2026 | Usuário aprovou MD-02 e solicitou avançar para MD-03 | Tarefa aberta | Em planejamento |

## Registro de alterações

| Data | Alteração | Motivo |
| --- | --- | --- |
| 21/10/2026 | Escopo e critérios iniciais da MD-03 registrados | Preparar execução controlada da microentrega autorizada |

## Aceite e referências

- Aceite do usuário: pendente para a entrega da MD-03.
- Commit/PR: não criado nesta tarefa até confirmação.
- Publicação: não realizada.
- Pendências: detalhar contratos, migração, endpoints, telas e testes antes da implementação.
