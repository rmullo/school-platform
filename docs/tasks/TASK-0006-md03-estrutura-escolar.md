# TASK-0006 — MD-03: estrutura escolar

## Identificação

- Microentrega: MD-03.
- Estado: Concluída.
- Data de criação: 21/10/2026.
- Origem da solicitação: usuário aprovou a MD-02 e solicitou avançar para a MD-03.
- Requisitos/decisões relacionados: RF-09, RF-11 e critérios de estrutura escolar da especificação vigente.
- Dependências: MD-02 concluída; somente dados fictícios na demonstração.

## Objetivo e limites

Implementar o cadastro e a consulta da estrutura necessária para organizar oferta escolar: ano letivo, etapa, série, turma, capacidade máxima e referência à autorização da etapa.

Inclui relacionamentos consistentes, validação de campos, ativação controlada da oferta e edição de capacidade sem ficar abaixo da ocupação existente. Inclui autorização no servidor para as operações administrativas e auditoria das alterações relevantes.

Ficam fora desta tarefa: alunos e responsáveis (MD-04), campanhas/contratos (MD-05), matrícula, regras financeiras, critérios etários detalhados ainda não definidos, importação de atos reais, publicação e uso de dados reais.

## Critérios de aceite

- [x] Diretor cria, consulta e edita ano letivo, etapa, série e turma com relacionamentos válidos.
- [x] Turma possui capacidade máxima positiva e a API impede capacidade inferior à ocupação registrada.
- [x] A etapa referencia órgão, ato, validade e evidência da autorização sem presumir que o cadastro seja uma autorização real.
- [x] Oferta não é ativada sem referência de autorização válida para a demonstração; valores reais não são inventados.
- [x] Secretaria e TI não recebem operações administrativas não previstas na matriz da MD-02.
- [x] Alterações importantes ficam auditadas, sem expor dados desnecessários.
- [x] API valida e autoriza as operações independentemente da interface.
- [x] Banco, API, contratos e interface têm testes proporcionais; a jornada principal é verificável por navegador.
- [x] Documentação afetada, roteiro manual, limitações e resultados reais são atualizados.
- [x] Aceite explícito do usuário é registrado antes de encerrar a tarefa.

## Decisões e pendências

- Os atos e órgãos usados nos testes serão fictícios e claramente identificados; nenhum valor real será inferido dos documentos.
- Os campos de autorização serão armazenados como referência administrativa, não como prova jurídica suficiente para uso real.
- Critérios etários, exceções, escrituração e capacidade efetivamente autorizada dependem de definição normativa/operacional posterior; não serão inventados nesta tarefa.
- A operação de ativar oferta será separada do simples cadastro para evitar que registros incompletos apareçam como oferta disponível.

## Trabalho realizado

Execução solicitada novamente em 22/10/2026. Contratos definidos antes de implementar: ano com número e período letivo (datas civis); etapa Infantil/Fundamental com referência administrativa de órgão, ato, evidência, validade e identificação de demonstração; série vinculada à etapa; turma vinculada a ano/série com capacidade positiva, ocupação técnica não editável na API e ativação separada. Ensino médio não entra no enum.

Diretor consulta e altera toda a estrutura; Secretaria/TI não acessam este módulo nesta entrega. Escritas exigem sessão válida, motivo nas edições/exclusões e versão esperada para impedir sobrescrita concorrente. Autorização deve cobrir o período letivo e não estar vencida para ativar; alteração de ano/etapa não pode invalidar oferta ativa. Capacidade e ocupação têm CHECK no PostgreSQL; auditoria, alteração e exclusão são atômicas. Exclusões com dependências, ocupação ou oferta ativa são bloqueadas.

Na abertura de 21/10 não houve implementação. Em 22/10 foram implementados contratos Zod, migração adicional com vínculos/unicidade/restrições de capacidade, módulo `school` na API, formulários React Hook Form/MUI e página de estrutura escolar por abas. Escritas auditadas com motivo, versão e estados anterior/posterior; oferta disponível deriva da ativação e validade atual da referência. Após retorno do usuário sobre a ausência da ação, foi adicionada exclusão confirmada para os quatro cadastros, com proteção de dependências, ocupação/oferta e auditoria. Não houve dependência nova, exclusão de volumes, alteração de migrações anteriores ou implementação de matrícula.

A skill do projeto orientou a divisão entre contrato, serviço, controller e UI; verificação de estados de erro/recuperação, captura móvel e testes por risco. A preparação autenticada das fixtures E2E usa o serviço real e cookie HttpOnly para não consumir o limite compartilhado de login em cada jornada. O teste dedicado de login continua verificando o formulário real com senha inválida e válida; o limitador não foi relaxado.

## Verificações

| Data | Cenário ou comando | Resultado observado | Evidência/limitação |
| --- | --- | --- | --- |
| 21/10/2026 | Revisão do roadmap, especificação, PRD, cadastros e módulos | Escopo e dependências conferidos | Nenhuma validação funcional da MD-03 executada ainda |
| 22/10/2026 | `pnpm build` / `pnpm typecheck` | Build dos cinco pacotes e tipos aprovados | Sem novas dependências; divisão de telas preservada |
| 22/10/2026 | `pnpm test` | 14 unitários aprovados | Datas civis, cobertura/limites de validade, capacidade e campos proibidos |
| 22/10/2026 | `pnpm test:integration` | 20 aprovados, sendo 9 novos da estrutura escolar | PostgreSQL isolado: RBAC, vínculos, duplicação, ativação, validade, ocupação, concorrência, exclusão protegida e rollback com falha de auditoria após escrita |
| 22/10/2026 | `pnpm test:e2e` | 11 aprovados, sendo 2 da estrutura escolar | Fluxo escolar inclui confirmação e exclusão de turma; regressões MD-01/MD-02 preservadas |
| 22/10/2026 | `pnpm smoke` | Aprovado na pilha Docker | Saúde, proxy protegido, documentação, correlationId e arquivo privado |
| 22/10/2026 | `docker compose up -d --build --wait api web` | Imagens atualizadas, inicialização/migração concluídas e serviços saudáveis | Contas e volumes existentes preservados |
| 22/10/2026 | Inspeção visual | Capturas 1440×1000 e 390×844 conferidas, sem corte de página | A ação Excluir usa o tema MUI e confirmação no mesmo diálogo; erro de resposta vazia corrigido após a primeira jornada |
| 22/10/2026 | Editor e diff | Sem erros no editor; `git diff --check` aprovado | CI remota e Dev Container não executados nesta tarefa |
| 22/10/2026 | Verificação adicional de teclado | Jornada cobriu ativação do botão por Enter e tabulação para o primeiro campo; exclusão confirmada no fluxo E2E | O teste aguarda o cadastro ficar habilitado após a consulta; sem retries |
| 22/10/2026 | Links e limpeza | 155 links locais conferidos; estrutura temporária removida e Diretor de teste preservado | Nenhum cadastro escolar permanente semeado |

Durante a primeira compilação foi corrigida a tipagem da seleção dinâmica de schemas. A primeira integração encontrou serialização de relações internas além do contrato público na consulta; corrigida e regressão coberta pela suíte aprovada. Não foram alteradas asserções para aceitar a falha, nem habilitados retries.

## Roteiro de teste do usuário

- Identificação da entrega: alterações locais da TASK-0006/MD-03 em 22/10/2026; não foi criado commit nesta tarefa.
- Preparação e dados fictícios: criar um ano, uma etapa com autorização fictícia, uma série e uma turma.
- Passos e resultado esperado: criar e consultar a estrutura; ativar uma oferta com referência fictícia; tentar capacidade inválida; tentar reduzir capacidade abaixo da ocupação; repetir ações com Secretaria e TI.
- Limitações conhecidas: não representa autorização escolar real nem cria alunos ou matrículas. Listagem integral sem paginação; sem upload de atos ou edição de ocupação. Exclusão exige primeiro remover dependências e desativar ofertas; turma ocupada não pode ser apagada. Datas/capacidades reais, critérios etários e uso de dados reais continuam pendentes. Roteiro detalhado no [guia da MD-03](../microentregas/MD-03/README.md#como-executar-e-testar).

## Feedback e ajustes

| Data | Retorno do usuário | Ação tomada ou tarefa vinculada | Situação |
| --- | --- | --- | --- |
| 21/10/2026 | Usuário aprovou MD-02 e solicitou avançar para MD-03 | Tarefa aberta | Em planejamento |
| 22/10/2026 | “faca md 03 agora” | Implementação executada e verificada | Entrega apresentada para validação |
| 22/10/2026 | Usuário informou que não havia opção de apagar os cadastros | Exclusão confirmada adicionada às quatro abas, com API, auditoria e testes de dependências | Ajuste validado |
| 22/10/2026 | “md 03 está ok. documente a finalização” | Usuário aprovou explicitamente a MD-03; tarefa encerrada documentalmente | Concluída |

## Registro de alterações

| Data | Alteração | Motivo |
| --- | --- | --- |
| 21/10/2026 | Escopo e critérios iniciais da MD-03 registrados | Preparar execução controlada da microentrega autorizada |

## Aceite e referências

- Aceite do usuário: registrado em 22/10/2026 — “md 03 está ok. documente a finalização”.
- Commit/PR: não criado nesta tarefa até confirmação.
- Publicação: não realizada.
- Pendências: comprovações operacionais e critérios legais reais não são substituídos pela demonstração. MD-04 não iniciada.
