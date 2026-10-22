# SmartSchool — especificação principal do MVP

> Especificação vigente de planejamento, revisada em 07/10/2026 por solicitação do usuário para incorporar a adequação legal e simplificar o MVP sem Kafka. MD-01 autorizada em 13/10 e aceita em 15/10/2026. Em 21/10/2026, autorizada a MD-02: acesso e auditoria básica.

> Atualização de 07/10/2026: o código e a infraestrutura da implementação anterior foram excluídos por solicitação do usuário. Os requisitos abaixo continuam como referência de planejamento; descrições da antiga Fase 1 não indicam funcionalidades presentes neste repositório, que foi mantido documental até a autorização da MD-01 em 13/10/2026.

## Autoridade e referências
> Contexto confirmado: escola privada em Assaré/CE, educação infantil e fundamental; ensino médio como expansão futura. As adequações documentais estão registradas na [decisão 0001](decisions/0001-adequacao-legal.md), com fundamentos no [mapa normativo](compliance.md). Elas não certificam a operação escolar; contratos, listas, atos locais e controles ainda precisam das evidências da [matriz](conformidade.md).

A solicitação de 29/09/2026 e as decisões posteriores do usuário são a fonte do planejamento. A autorização de 07/10/2026 para adequar a documentação substitui as regras incompatíveis identificadas na decisão 0001. A [decisão 0002](decisions/0002-mvp-sem-kafka.md) também substitui a obrigatoriedade de Kafka e processamento assíncrono no MVP. Referências históricas não prevalecem sobre esta revisão. O detalhamento continua por etapas; a autorização atual abrange a MD-03, solicitada em 22/10/2026 após aceite da MD-02.
Conversa: chatgpt-conversation://6952a525-7750-8327-9051-ca4a6ad2da84.
O retorno integral disponível está em reference-conversation.json: cinco turnos, sem cursor para trechos anteriores, sem anexos. Não foi possível recuperar os tópicos 3.1–3.5 ou validar os documentos originais. A pasta sources do projeto estava vazia. Nenhum arquivo sincronizado foi alterado.

Anexos citados, **não disponíveis nesta execução**:
- CONTRATO DE MATRÍCULA 2026.docx
- Ficha de Matrícula 2026.pdf
- Lista de Materiais.pdf
- Orçamento Mensalidades 2026.txt
- MENSALIDADE 2026.xlsx
- Imagens de valores por segmento/série

Não inferir outros valores a partir dos nomes dos arquivos. Antes de implementar seus detalhes, recuperar e conferir os anexos.

## Limite desta entrega
MD-01: fundação com API, interface de estado, banco, arquivos, Compose/Dev Container e verificações. Guia em [MD-01](microentregas/MD-01/README.md). Os requisitos escolares e controles das etapas posteriores permanecem planejamento; não há autorização para implementar o sistema inteiro.

MD-02: acesso e auditoria básica autorizados em 21/10/2026, com escopo e critérios na [TASK-0005](tasks/TASK-0005-md02-acesso-e-auditoria.md). Matriz inicial, execução e limites em [MD-02](microentregas/MD-02/README.md). As permissões para operações escolares continuam dependentes das microentregas correspondentes.

## Arquitetura aprovada
- Monorepo pnpm workspaces + Turborepo; TypeScript.
- Node.js LTS, NestJS; API monólito modular, REST /api/v1 e OpenAPI/Swagger.
- React + Vite + React Router + TanStack Query + React Hook Form + Zod + MUI. SPA interna.
- PostgreSQL + Prisma. Valores financeiros NUMERIC/DECIMAL, abstração Money; nunca float. Vencimento como data; instantes operacionais UTC; timezone da escola configurável.
- Duas aplicações: apps/api (NestJS modular) e apps/web (React). Operações de negócio síncronas na API, com transações PostgreSQL; sem billing-worker, projection-worker ou outbox-publisher no MVP.
- JSON + Zod para validação dos contratos necessários; sem pacotes de eventos, tabelas OutboxEvent/ProcessedEvent ou infraestrutura de mensageria antecipados.
- MinIO local, interface S3; comprovantes e documentos fora do disco das aplicações.
- Docker Compose e VS Code Dev Container para desenvolvimento.
- Pino, correlationId, OpenTelemetry, Prometheus e Grafana.
- Testcontainers para PostgreSQL, Playwright frontend e CI GitHub Actions. Verificar rollback, concorrência e prevenção de operações duplicadas; testes Kafka ficam fora do MVP.
- Containers stateless, env, stdout, /health, /ready, graceful shutdown. Kubernetes e AWS são etapas posteriores, sem dependência de cluster para o MVP. O desenho de nuvem será revisado quando necessário; MSK não é requisito atual.
- Módulos: students, guardians, school-years, grades, classes, campaigns, enrollments, billing, payments, sales, products, documents, users, audit.
- Organização frontend por funcionalidade: students, classes, campaigns, enrollments, billing, payments, sales, dashboard.
- Ports and Adapters nas integrações; Strategy para cálculos; Factory para cobranças; Policy/Specification para elegibilidade e confirmação; Repository onde trouxer desacoplamento útil. Sem abstrações especulativas.

## Acesso, segurança e auditoria
Sistema interno para Diretor, Secretaria e TI, contas individuais.
DIRECTOR autoriza negociações financeiras e campanhas; SECRETARY realiza operações administrativas e financeiras de rotina; IT administra aspectos técnicos.
Aplicar menor privilégio. IT não recebe acesso irrestrito a cadastros, comprovantes, saúde ou restrições judiciais por padrão; acesso excepcional deve ser justificado, limitado e auditado. Desativar acessos de funcionários desligados.
E-mail + senha, Argon2id, JWT curto, refresh token rotativo e protegido, RBAC.
Registrar quem fez, o quê, quando, registro afetado e motivo quando necessário, especialmente negociações, pagamentos, reversões e cancelamentos.
HTTPS em produção, Helmet, CORS restrito, rate limit no login, validação de entrada, limite/tipo de upload, segredos fora do código.
Não registrar dados pessoais desnecessários de crianças em logs.
Erros próximos de Problem Details: type, title, status, detail.

## Privacidade e governança de dados
Inventariar finalidade, base legal, categorias de dados, destinatários e retenção por tratamento, considerando o melhor interesse de crianças e adolescentes. Consentimento não é base universal; quando aplicável a criança, verificar representação legal e os requisitos específicos da LGPD.
Dados de saúde e apoio à inclusão têm acesso restrito e base legal adequada a dados sensíveis. Não tornar campos opcionais ou autorização de imagem/marketing condições de matrícula. Esses usos opcionais não são adicionados ao MVP.
Preparar aviso de privacidade, canal para direitos dos titulares, verificação de identidade/representação e registro de respostas. Corrigir dados com rastreabilidade; pedidos de exclusão devem considerar obrigações de guarda e exercício regular de direitos, com resposta fundamentada.
Definir tabela de retenção por categoria e destino ao final do prazo, incluindo banco, documentos, registros de auditoria, backups e logs. Registro de auditoria não significa retenção ilimitada. Dados reais não entram em repositórios, exemplos, ambientes de desenvolvimento ou testes.
Formalizar papéis da escola e dos fornecedores, procedimento de incidentes e avaliação de transferências internacionais antes de nuvem externa. Prazos e referências estão em [SECURITY.md](../SECURITY.md) e no mapa normativo. Encarregado/canal, bases por campo e prazos específicos continuam pendentes de definição operacional.

## Estrutura escolar e campanhas

MD-03 implementada e aprovada pelo usuário em 22/10/2026, com escopo na [TASK-0006](tasks/TASK-0006-md03-estrutura-escolar.md) e [guia da entrega](microentregas/MD-03/README.md). A MD-05 foi implementada e aceita em 22/10/2026 na [TASK-0008](tasks/TASK-0008-md05-contrato-plano-campanha.md), cobrindo campanha, versão de plano, composição anual e oferta de turmas sem matrícula ou cobrança.
Ano letivo, série, turma e capacidade máxima por turma.
Ativar oferta apenas para etapas autorizadas, registrando órgão, ato, validade e evidência. Conferir capacidade, critérios etários e escrituração conforme a etapa e o sistema de ensino competente; não adotar limites locais presumidos. Ensino médio permanece futuro, condicionado a revisão regulatória e autorização própria.
Diretor cria campanhas; pode liberar todas as turmas de um ano de uma vez.
Várias campanhas no mesmo ano letivo.
Campanha define valores, documentos, materiais e kits conforme regras aprovadas.
Vincular campanha à versão de contrato, total anual/plano aplicável, descontos, vagas e calendário. Registrar divulgação e sua evidência, observando antecedência mínima de 45 dias da data final de matrícula. Várias campanhas não reiniciam nem dispensam essa obrigação; entrada tardia deve remeter às condições aplicáveis documentadas.
Respeitar o direito à renovação de alunos adimplentes conforme calendário, regimento e contrato. Não distribuir todas as vagas a novos alunos sem considerar esse direito. Não impor sobretaxa de inclusão ou recusa por deficiência; necessidades de apoio não decidem elegibilidade financeira.
Matrícula em andamento não reserva vaga.
Confirmar vaga conforme capacidade e critérios da etapa, identificação do contratante e verificação de representação legal do aluno, contrato aplicável e parcela inicial da anuidade paga ou com dispensa/negociação formal registrada pelo Diretor. Analisar inadimplência anterior apenas na renovação da relação contratual pertinente, conforme a seção de rematrícula; não exigir quitação de outra escola.
A confirmação precisa de transação PostgreSQL e controle de concorrência sobre a turma: conferir elegibilidade aplicável e capacidade, confirmar, ocupar vaga, gerar parcelas ainda não registradas e registrar auditoria atomicamente. Nunca exceder capacidade na disputa pela última vaga.

## Pessoas
Aluno possui identidade cadastral contínua entre anos letivos. Isso não autoriza conservar todos os dados e documentos indefinidamente; aplicar retenção por categoria.
Pai e mãe são informações do aluno.
Cada matrícula possui exatamente um responsável financeiro, que também é o contratante; pode não ser parente.
Filiação, representação legal, responsabilidade financeira e autorização de retirada são vínculos distintos. Não exigir preenchimento artificial de pai e mãe, nem presumir poder de representação a partir do pagamento. Registrar vigência e evidência de guarda/tutela ou restrição pertinente, sem exposição ampla de documentos judiciais.
Identificar possíveis irmãos por mesmo pai, mesma mãe ou responsável financeiro. Secretaria confirma o desconto; identificação não aplica desconto automaticamente.
Mesmo responsável financeiro é apenas sugestão administrativa, não prova de parentesco nem fundamento automático de solidariedade por dívida. Manter a obrigação vinculada ao contratante e ao contrato.

## Matrícula e conclusão
Separar situação da matrícula e situação de conclusão: aluno pode estar MATRICULADO e PENDENTE de conclusão.
Conclusão administrativa exige apenas os documentos necessários e legitimamente exigíveis para a etapa, em lista versionada com finalidade/fundamento. Casos excepcionais ou documentos temporariamente indisponíveis devem ser analisados pela Secretaria conforme a norma aplicável, sem recusa automática indiscriminada.
Situação de livros, entregas e vendas é acompanhada separadamente e não condiciona confirmação ou conclusão da matrícula. Pendência administrativa ou comercial não impede aulas, avaliações ou documentos escolares por motivo financeiro.
Kit de livros por série/ano: compra na escola, compra externa ou cortesia/isenção.
Compra de livros na escola: pagamento e entrega são controles separados.
Material coletivo necessário ao serviço integra os custos da anuidade: não exigir entrega obrigatória, taxa substitutiva ou quitação como condição de matrícula. Listas de materiais individuais dependem de classificação e justificativa pedagógica; não criar fornecedores exclusivos ou venda casada. Kits exclusivos precisam de análise específica antes de oferta.
Fardamento: venda opcional, sem impedir conclusão.

## Financeiro
Matrícula é o ato de ingresso/renovação. Sua cobrança inicial é uma parcela integrante da anuidade, nunca taxa adicional ao total anual anunciado e contratado.
O plano operacional pretendido é uma parcela inicial mais até 11 parcelas restantes, normalmente fevereiro–dezembro, vencimento dia 10, como plano alternativo admitido na legislação. Documentar o total nominal, parcelas e condições de desconto; não duplicar a parcela inicial ao gerar cobranças após a confirmação. A soma das parcelas educacionais nominais deve corresponder ao total contratado para o período, sem acréscimo externo de matrícula.
Entrada durante o ano: conforme confirmação do usuário em 08/10/2026, o total do período é a parcela inicial mais as mensalidades dos meses restantes até dezembro, incluindo o mês de ingresso. Não cobrar competências anteriores nem abater automaticamente a inicial da primeira mensalidade. A inicial integra o total anunciado/contratado, sem taxa externa a esse total. A composição comercial está definida; a conciliação com contrato e tabela reais permanece pendente. Ingresso após o dia 10 e eventual proporcionalidade por dias ainda exigem definição. Ver [decisão 0003](decisions/0003-ingresso-durante-o-ano.md) e [exemplos da MD-00](microentregas/MD-00/financeiro.md).
Diretor pode negociar parcela inicial, primeira mensalidade restante, antecipação de seis meses ou do saldo anual, sempre com reflexo no plano e no total devido. Negociação não autoriza cobrança proibida, renúncia a direito obrigatório ou alteração retroativa de condições aceitas.
Guardar valor original, valor negociado, diferença, motivo, autorizador e data.
Multa e juros previstos em configuração, padrão zero.
Multa moratória não pode ultrapassar 2% da prestação. Juros e eventual correção dependem de previsão válida e parametrização revisada; não adotar taxa universal presumida. Impedir reajuste contratual inferior a um ano, salvo hipótese legal verificada. Não cobrar sobretaxa para inclusão.

Infantil, referências comerciais anteriores preservadas, sem recálculo nesta revisão. A composição e divulgação da anuidade ainda precisam ser conciliadas com o contrato antes do uso real:
- Mensalidade cheia R$ 315,00.
- Pontualidade R$ 15,00: até dia 10, R$ 300,00.
- Irmãos: 10% sobre R$ 300,00, confirmado pela Secretaria.
- Dois irmãos: R$ 540,00 até dia 10; R$ 570,00 após dia 10.
- O desconto de irmãos permanece após vencimento; perde-se apenas a pontualidade.
- Parcela inicial antes chamada matrícula: R$ 275,00 por aluno, sem desconto de irmãos; deve integrar a anuidade e não ser somada a ela como taxa externa.
- Não extrapolar esses valores a outros segmentos/séries.

Pagamentos manuais pela Secretaria: DINHEIRO, PIX, TRANSFERÊNCIA_BANCÁRIA, CARTÃO_CREDITO.
Comprovante pode ser anexado quando existir.
Aceitar pagamento parcial e maior que o devido, mantendo saldo devedor/credor.
Diretor pode conceder desconto na regularização.
Pagamento incorreto é revertido com rastreabilidade, nunca apagado.
Distinguir reversão de registro errado de restituição efetiva: devoluções e compensações são movimentos vinculados ao recebimento original, com valor, motivo, data, autor e comprovante quando houver. Não devolver duas vezes nem usar o mesmo crédito em duas operações; compensação exige registro de destinação e ciência/aceite cabível. Uma restituição não deve reabrir indevidamente dívida cancelada.
Comprovante interno não substitui documento fiscal. Manter referência ao documento emitido externamente quando aplicável; regime e procedimento serão confirmados pela contabilidade, sem presumir integração fiscal no MVP.

## Rematrícula, transferência e cancelamento
Na renovação para o ano seguinte, considerar inadimplência da relação contratual pertinente, respeitando calendário e condições legais. Débito de outra escola, irmão ou outro aluno não gera bloqueio automático. Acordos vigentes e contestações exigem análise de sua situação, sem tratar o saldo original isoladamente como inadimplência atual.
Não cancelar matrícula durante o ano por dívida nem bloquear frequência, provas, atendimento ou documentos. Eventual não renovação não se confunde com cancelamento solicitado pelo contratante/representante competente.
Transferência não é bloqueada por dívida: registrar tentativa de notificação e ciência quando obtida; ausência de assinatura, contato ou quitação não impede a liberação dos documentos.
Cancelamento solicitado registra data efetiva e fundamento, preserva histórico, apura obrigações validamente devidas até o encerramento, cancela cobranças futuras e libera vaga. Vencimento isolado não torna exigível cobrança indevida; ajustar cobranças de períodos não prestados conforme política contratual válida.
Apurar créditos e restituições, inclusive antecipações, sem retenção integral automática. Para desistência antes das aulas, adotar devolução integral da parcela inicial como política do projeto alinhada à orientação do Decon/CE. Aplicar também direito de arrependimento quando cabível. Demais hipóteses exigem política documentada; não inventar multa de cancelamento.
A liberação da vaga e os ajustes financeiros aplicáveis ocorrem na mesma transação PostgreSQL do cancelamento.
Detalhes de casos-limite ainda não descritos, por exemplo vencimento no próprio dia do cancelamento, devem ser explicitados na fase de negócio antes da implementação.

## Processamento transacional e relatórios
A API NestJS executa os casos de uso chamando os módulos envolvidos no mesmo processo. PostgreSQL é a fonte de verdade. O MVP não depende de broker, publicação de eventos, consumidores, Outbox ou projeções assíncronas.

Confirmação de matrícula, ocupação da vaga, geração das parcelas ainda inexistentes e auditoria da operação são persistidas na mesma transação. Em falha, nenhuma dessas alterações é confirmada parcialmente. Pagamento inicial já registrado permanece rastreável, sem ser apagado ou duplicado por falha na confirmação.

Cancelamento, liberação de vaga, cancelamento/ajuste das cobranças aplicáveis e registro da apuração de crédito ocorrem na mesma transação. A devolução efetiva de dinheiro pode ocorrer depois e deve ser registrada como movimento próprio; não simular transferência bancária dentro da transação do banco.

Recebimentos, alocações, reversões, créditos e registros de restituição devem atualizar os dados relacionados e a auditoria atomicamente. Repetição da mesma solicitação não pode duplicar matrícula, parcela ou movimento. Usar validações de estado, identificadores da operação, restrições de unicidade e controle de concorrência no banco; definir detalhes na implementação de cada caso de uso.

Relatórios e dashboard consultam PostgreSQL diretamente, com índices e consultas adequadas. Vencimento é apurado por data, saldo e situação da cobrança, sem depender de evento ou tarefa diária para reconhecer atraso. Restringir relatórios a perfis autorizados; agrupamento familiar não transfere dívidas nem bloqueia irmãos. Não enviar cobrança externa automaticamente.

Chamadas a armazenamento de arquivos e demais serviços externos não integram a atomicidade do PostgreSQL. Documentar seus estados e recuperação quando esses fluxos forem implementados. Tarefas em segundo plano só serão adicionadas diante de necessidade concreta, com persistência, exclusão de execução concorrente e recuperação adequadas; nenhuma fila alternativa ou worker genérico é obrigatório nesta fase.

Kafka, Outbox e contratos de evento ficam como possibilidades futuras, condicionadas a benefício demonstrável e nova decisão. O [planejamento anterior](historico/eventos-planejados.md) é histórico, não interface a implementar antecipadamente.

## Fora do MVP
Cobrança automatizada externa, WhatsApp/e-mail automáticos, agente conversacional em produção, gateway de pagamento e integração Serasa.
Secretaria realiza contatos externamente pelos meios atuais.
Kafka/KRaft, Kafka UI, workers separados, Outbox, consumidores, retry/DLQ de mensagens e projeções assíncronas não integram o MVP. Reconhecer uma cobrança vencida não dispara comunicação externa.

## Divergências já identificadas
Regras antigas substituídas constam na [decisão 0001](decisions/0001-adequacao-legal.md). Pendências, **sem nova inspeção dos anexos**:

1. A consolidação antiga relata contrato com 12 parcelas e primeira na matrícula. Conciliar total e parcelamento com a regra vigente de parcela inicial incluída na anuidade; o número de parcelas, isoladamente, não demonstra irregularidade.
2. A consolidação relata desconto de irmãos condicionado ao dia 10 no contrato. O planejamento mantém irmãos após vencimento e remove apenas pontualidade. Revisar documento antes de novas contratações, sem modificar contratos existentes unilateralmente.
3. A arquitetura antiga exigia eventos e Kafka; esse requisito foi substituído pela decisão 0002. Tópicos, envelope e nomes anteriores são apenas histórico, sem obrigação de compatibilidade futura.
4. MinIO: imagens oficiais não estavam acessíveis em 29/09/2026; repositório oficial arquivado. Mantido MinIO local via build de fonte oficial com release fixa. Não substituir fornecedor silenciosamente. Produção continua S3.

As adequações autorizadas orientam o produto; nenhuma decisão operacional afasta obrigação legal. Esta fase não altera contratos assinados nem valida os valores para cobrança.

## Sequência aprovada

As capacidades e a arquitetura aprovadas serão desenvolvidas por microentregas. O [roteiro MD-00 a MD-15](roadmap.md#caminho-de-desenvolvimento), proposto em 08/10/2026 para revisão do usuário, detalha ordem, dependências e aceite; sua elaboração não autoriza iniciar todas as etapas.

Começar pelas regras necessárias e fundação, seguir por acesso/cadastros e pelo fluxo completo de matrícula/financeiro, depois documentos, renovação/transferência, compras, relatórios e piloto. Segurança, auditoria, testes e documentação acompanham cada incremento; validações finais de operação não substituem essas verificações contínuas. Kubernetes/AWS permanecem posteriores.

Cada tarefa realizada e alteração deve ser registrada em [tasks/](tasks/README.md) e resumida no [CHANGELOG](../CHANGELOG.md), com verificações e feedback reais. Entrega implementada aguarda teste do usuário; somente aceite explícito encerra a tarefa. Ajustes que ampliem escopo terão tarefa vinculada.

Não iniciar regras completas antes de a fundação estar executável, limpa, documentada e validada.
