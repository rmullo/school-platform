# Roadmap de microentregas

> Plano elaborado em 08/10/2026. Planejar não autoriza implementar todas as etapas. Cada microentrega passa por demonstração, teste do usuário e ajustes antes de avançar. Usar dados fictícios até cumprir as condições de uso real.

## Etapa atual — MD-02: acesso e auditoria básica

Em 21/10/2026, o usuário solicitou executar a MD-02. Escopo, critérios e verificações registrados na [TASK-0005](tasks/TASK-0005-md02-acesso-e-auditoria.md); guia em [MD-02](microentregas/MD-02/README.md). Implementada e **Em validação**, com aceite pendente, sem autorização para MD-03.

Em 06/10/2026, o usuário orientou priorizar a documentação e conduzir o trabalho passo a passo. A implementação permaneceu pausada até a autorização da MD-01 em 13/10/2026.

Em 07/10/2026, o usuário solicitou remover a implementação existente e preparar um repositório apenas documental para o GitHub. Esse marco foi preservado no histórico. Após aprovar a MD-00, o usuário solicitou “quero md-01” em 13/10/2026, autorizando somente a fundação.

Em 07/10/2026, o usuário autorizou adequar a documentação aos achados legais. Especificação, PRD, dados, módulos e segurança receberam essa revisão; o [índice](README.md) distingue documentos parciais e pendências. O modelo de organização continua baseado no OpenClinic.

## Pendências antes do uso real

- Conciliar contrato, total anual, descontos, entrada tardia e política de restituição com as regras revisadas.
- Conferir lista de materiais, documentos exigíveis e atos de autorização/capacidade por etapa.
- Definir bases legais, retenção, representação, responsáveis, canais e procedimentos de privacidade/incidentes.
- Confirmar procedimento fiscal e contratos/fluxos de fornecedores antes das operações correspondentes.
- Implementar e verificar os critérios do PRD somente quando o usuário autorizar desenvolvimento.

Esses pontos são condições de prontidão, não declaração de que a escola esteja irregular nem exigência de construir integrações fora do MVP. Ensino médio permanece futuro. A [matriz](conformidade.md) acompanha o que falta comprovar.

## Arquitetura de implementação vigente

A [decisão 0002](decisions/0002-mvp-sem-kafka.md) adia Kafka, Kafka UI, os três workers, Outbox e o processamento por mensagens. Planejar uma API NestJS modular, frontend React, PostgreSQL e MinIO; manter os demais requisitos de desenvolvimento e observabilidade aprovados. Relatórios consultam o banco e operações centrais são transacionais.

A fundação deve iniciar do zero conforme o README, sem dependências de mensageria. A primeira matrícula completa inclui plano financeiro, pagamento inicial, confirmação e parcelas restantes; não adiar consistência financeira para uma etapa de eventos. A verificação cobre rollback, disputa de vaga e repetição de operações, além de permissões e interface.

Kubernetes/AWS permanecem posteriores. Retomar mensageria exige benefício concreto e nova decisão; não existe compromisso de introduzi-la ao final do MVP. A elaboração segue sob orientação do usuário; MD-01 aceita e MD-02 autorizada, sem avanço automático.

## Próximas etapas

A MD-00 foi solicitada pelo usuário em 08/10/2026 e aprovada documentalmente em 13/10/2026. As demais dependem de orientação do usuário, na ordem abaixo. Uma microentrega deve caber em uma demonstração curta e verificável; se o detalhamento revelar vários fluxos independentes, dividi-la em partes antes de implementar. Não há estimativas de calendário sem detalhar as tarefas e a disponibilidade para teste.

## Caminho de desenvolvimento

Cada linha representa um incremento testável. Os IDs RF remetem ao [PRD](prd.md); segurança, auditoria, acessibilidade e documentação são verificadas desde a primeira funcionalidade pertinente, e não apenas no piloto.

| ID | Microentrega e dependência | Tarefas a detalhar | O que o usuário testará | Aceite mínimo |
| --- | --- | --- | --- | --- |
| MD-00 | Regras e exemplos, antes das funcionalidades afetadas | Conciliar total anual/parcela inicial, descontos e ingresso tardio; desenhar estados da matrícula; definir cancelamento, representação e documentos; separar pendências reais de exemplos fictícios | Percorrer uma matrícula normal, irmãos, ingresso tardio e desistência usando exemplos e esboços de telas | Resultado esperado de cada cenário registrado; nada pendente é tratado como decidido. Questões externas bloqueiam apenas o fluxo/uso real correspondente |
| MD-01 | Fundação executável, após orientação para código | Monorepo; API/web; PostgreSQL/Prisma; MinIO; Compose/Dev Container; configuração, logs e verificações iniciais; README de instalação | Iniciar o ambiente do zero, abrir a tela de estado e reiniciar sem perder dados de exemplo | Serviços necessários saudáveis, erros compreensíveis e passos reproduzíveis; sem Kafka/filas/workers |
| MD-02 | Acesso e auditoria básica, após MD-01 | Login, sessão/refresh, contas individuais, DIRECTOR/SECRETARY/IT, encerramento e revogação de acesso; auditoria das alterações | Entrar com cada perfil, tentar ação proibida, sair e testar conta desativada | API também impede acesso indevido; credenciais não aparecem em logs. Base de RF-09 e RF-12 |
| MD-03 | Estrutura escolar, após MD-02 | Ano, etapa, série, turma, capacidade e referência a autorização; cadastro e consulta | Criar ano e turmas, editar capacidade e verificar limites/validações | Relacionamentos consistentes; capacidade não reduzida abaixo da ocupação sem solução explícita; atos fictícios só em demonstração. RF-11 |
| MD-04 | Pessoas e vínculos, após MD-02 | Aluno, filiação, representante legal, contratante e permissões; busca e revisão de cadastro | Cadastrar aluno com pagador não parente; corrigir dados e diferenciar os papéis | Um contratante por matrícula futura sem conceder poderes legais automaticamente; dados restritos protegidos. RF-06 e RF-08 |
| MD-05 | Contrato, plano e campanha, após MD-03 e regras financeiras de MD-00 | Versionar contrato/tabela; composição anual e plano; regras de irmãos/pontualidade; divulgação, calendário e vagas | Montar campanha e conferir total, descontos, datas e condições | Parcela inicial incluída no total; sem material coletivo obrigatório; alteração não sobrescreve condições já aceitas. RF-01, RF-02, RF-04 |
| MD-06 | Matrícula em andamento, após MD-04 e MD-05 | Escolher aluno/turma, verificar vínculos, associar contrato/plano e registrar pendências; criar obrigação inicial sem duplicação | Salvar e retomar uma matrícula; conferir contratante, valor inicial e vaga ainda disponível | Rascunho não ocupa vaga, não cria todas as mensalidades nem é apresentado como matrícula confirmada |
| MD-07 | Recebimento inicial e confirmação, após MD-06 | Registrar pagamento manual da parcela inicial ou negociação/dispensa formal; confirmar vaga e gerar demais parcelas na mesma transação | Pagar, confirmar e conferir turma e plano; repetir clique e disputar a última vaga em dois atendimentos | Sem duplicar cobrança/pagamento ou exceder capacidade; falha desfaz confirmação/vaga/parcelas conjuntamente e preserva recebimento anterior válido. RF-01 e RF-09 |
| MD-08 | Recebimentos e correções, após MD-07 | Pagamento integral/parcial/a maior; alocação, crédito, recibo e reversão de lançamento incorreto | Pagar menos/mais, destinar crédito e reverter erro com motivo | Saldos conciliados e histórico preservado; crédito não usado duas vezes; recibo não simula nota fiscal. RF-03 e RF-13 |
| MD-09 | Negociação e entrada tardia, após MD-08 e regras correspondentes de MD-00 | Negociar primeira mensalidade restante, antecipação e regularização; ingresso no decorrer do ano | Comparar original/negociado e testar matrícula em agosto com meses restantes | Autorização do Diretor registrada; sem competências anteriores, cobrança duplicada ou mudança retroativa silenciosa. RF-01 e RF-04 |
| MD-10 | Cancelamento e restituição, após MD-08 e política de MD-00 | Cancelar com data efetiva, ajustar cobranças, liberar vaga, apurar crédito e registrar devolução efetiva; separar de reversão de erro | Desistir antes/depois das aulas e cancelar após antecipação; conferir histórico e saldo | Sem retenção integral automática, parcelas futuras indevidas ou devolução duplicada; cancelamento não é acionado por dívida durante o ano. RF-03 e RF-05 |
| MD-11 | Documentos e conclusão, após MD-06 | Lista necessária por etapa, upload privado, verificação e exceções fundamentadas; conclusão administrativa separada das compras | Anexar, substituir e validar documento; testar acesso de TI e pendência comercial | Acesso restrito e falha de upload recuperável; venda/livros/material coletivo não bloqueiam conclusão. RF-02, RF-07, RF-08 |
| MD-12 | Rematrícula e transferência, após MD-08 e MD-11 | Reutilizar cadastro no novo ano, analisar contrato/acordos, proteger direito de renovação; registrar transferência/notificação e liberar documentos | Renovar aluno adimplente e analisar acordo; transferir com dívida e sem assinatura de ciência | Sem bloqueio por dívida de irmão/outra escola; transferência/documentos não dependem de quitação ou ciência. RF-05, RF-06 e RF-11 |
| MD-13 | Livros, materiais e uniformes, após MD-08 e MD-11 | Kit por série/ano; compra externa/cortesia; venda na escola com pagamento e entrega distintos; uniforme opcional | Registrar livro externo, compra com entrega posterior e uniforme; conferir matrícula | Compras não condicionam direitos escolares ou conclusão; sem taxa coletiva obrigatória. RF-02, RF-07 e RF-13 |
| MD-14 | Consulta gerencial, após fluxos financeiros | Dashboard e consultas de recebimentos, saldos, vencimentos e pendências; filtros por período/contrato | Conferir relatórios contra casos já testados, inclusive reversão, desconto, crédito e devolução | Totais conciliados com registros do PostgreSQL; acesso restrito e dívida por contrato, sem exposição pública |
| MD-15 | Preparação e piloto, após fluxos utilizados e pendências operacionais resolvidas | Revisar privacidade/retenção, canais, fornecedores, procedimento fiscal; restaurar backup; validar observabilidade e acessibilidade; roteiro com equipe e plano de recuperação | Repetir jornada completa, restaurar base de teste, testar permissões e recuperação; depois piloto limitado autorizado | Pendências impeditivas encerradas com evidência; aprovação expressa para dados reais/produção. RF-08 a RF-13 |

MD-03 e MD-04 não dependem entre si; a ordem pode ser ajustada. MD-11 pode ser antecipada após MD-06 se documentos forem a prioridade. Para experimentar MD-07 antes de MD-10/MD-15, usar exclusivamente dados e recebimentos fictícios; demonstração não habilita operação financeira real.

O cadastro e as fórmulas devem ser verificados em cada entrega. MD-09 completa as negociações; descontos de irmãos e pontualidade necessários à matrícula já entram em MD-05/MD-07. O detalhe do que o usuário fará e do resultado esperado é registrado nas tarefas antes de programar.

Se o piloto receber cadastros ou saldos anteriores da escola, detalhar uma tarefa de preparação e conciliação desses dados antes da entrada em produção. Não presumir que ausência de histórico no banco significa ausência de débitos. Isso não cria integração automática ou importador completo no escopo atual.

## Ciclo de cada microentrega

1. Detalhar apenas a microentrega escolhida em tarefas pequenas, com escopo, dependências e critérios de aceite.
2. Atualizar regras e exemplos afetados antes de implementar; sinalizar decisões de negócio pendentes.
3. Implementar o necessário de banco, API e tela para demonstrar o fluxo completo, incluindo permissões, auditoria e mensagens de erro.
4. Executar verificações proporcionais ao risco: cálculos, transações/concorrência e permissões recebem testes específicos; fluxo principal recebe verificação de interface. Registrar o que passou, falhou ou não foi executado.
5. Entregar instruções curtas para o usuário testar: preparação fictícia, passos, resultado esperado, versão testável e limitações.
6. Registrar o retorno do usuário. Corrigir na mesma tarefa quando necessário para atender ao aceite; mudança de escopo gera tarefa vinculada e atualização dos documentos afetados.
7. Repetir somente as verificações afetadas e registrar aceite explícito. Não presumir aprovação pelo silêncio nem iniciar automaticamente a próxima entrega.

## Registro obrigatório de tarefas e alterações

O [registro de tarefas](tasks/README.md) é a fonte de acompanhamento. Cada tarefa tem ID, microentrega, estado, escopo, alterações, testes, roteiro manual, retorno e aceite. O [changelog](../CHANGELOG.md) resume as mudanças por versão, com links às tarefas; decisões estruturais ficam em [decisions/](decisions/README.md).

Não é necessário criar todos os arquivos de tarefas futuras agora. O roteiro é o backlog de alto nível; abrir as tarefas da microentrega quando ela for selecionada. No fechamento, atualizar também PRD, especificação, cadastros, módulos, README ou matriz de conformidade quando afetados. Commit ou push só é registrado como realizado depois da confirmação real da operação.

## Situação das microentregas

A [MD-00](microentregas/MD-00/README.md) está **concluída documentalmente**, com aceite do usuário em 13/10/2026: “tudo ok no md-00”, registrado na [TASK-0002](tasks/TASK-0002-md00-regras-e-exemplos.md). As pendências P-01 a P-07 continuam abertas para resolução antes dos fluxos afetados. A [MD-01](microentregas/MD-01/README.md) está concluída com aceite em 15/10/2026 na [TASK-0003](tasks/TASK-0003-md01-fundacao.md), autorizada em 13/10/2026. A [MD-02](microentregas/MD-02/README.md) foi autorizada em 21/10/2026 e está **Em validação**, com aceite pendente na [TASK-0005](tasks/TASK-0005-md02-acesso-e-auditoria.md). MD-03 a MD-15 seguem planejadas, sem início automático. O roteiro geral e o fluxo documental estão registrados na [TASK-0001](tasks/TASK-0001-plano-de-microentregas.md).

## Sequência técnica vigente

A [especificação](SPECIFICATION.md#sequência-aprovada) remete a este roteiro como ordem proposta de desenvolvimento e validação. A arquitetura sem Kafka e as adequações legais permanecem vigentes. A ordem pode ser revista com o usuário sem perder dependências, critérios ou histórico.

## Modelo para detalhar uma etapa

- Objetivo.
- Documentos envolvidos.
- Perguntas a resolver.
- Resultado esperado.
- Situação da revisão.
