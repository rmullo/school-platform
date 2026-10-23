# Organização dos módulos

> Revisão parcial de 07/10/2026: adequação legal e simplificação do MVP sem Kafka. MD-09 foi concluída com negociação autorizada e entrada tardia transacionais; proporcionalidade por dias, cancelamento e restituição permanecem fora.

## Como ler este documento

Os módulos seguem a [especificação vigente](SPECIFICATION.md). A [decisão 0001](decisions/0001-adequacao-legal.md) corrige as regras legais; o [PRD](prd.md) fornece os critérios de aceite. A [decisão 0002](decisions/0002-mvp-sem-kafka.md) define chamadas síncronas entre módulos da API e transações PostgreSQL. Responsabilidades abaixo não criam novos serviços independentes.

## Visão geral

| Área | Responsabilidade nesta revisão |
| --- | --- |
| students / guardians | Separar aluno, filiação, representação e contratante; aplicar finalidade, acesso e retenção |
| school-years / grades / classes | Etapas, capacidade fundamentada e referência a autorizações válidas |
| campaigns | Condições contratuais versionadas, divulgação, calendário e direito de renovação |
| enrollments | Confirmar conforme critérios legítimos e vaga; conclusão documental separada de compras |
| billing | Plano com parcela inicial incluída; ajustes, cancelamento de cobranças futuras e dívida por contrato |
| payments | Recebimentos, alocação, reversão de erro, restituição efetiva e saldo credor sem duplicidade |
| sales / products | Livros e uniformes opcionais, compra externa, pagamento/entrega separados; sem taxa obrigatória de material coletivo |
| documents | Documentos necessários, versões, permissão e retenção; emissão/liberação escolar sem bloqueio por dívida |
| users / audit | Menor privilégio e rastreabilidade, incluindo acessos excepcionais e desligamentos |

Na [MD-02](microentregas/MD-02/README.md), o módulo de acesso coordena contas, sessões, perfis e auditoria de alterações de conta na mesma transação. Diretor administra contas; Secretaria não administra acessos; TI consulta o painel técnico sem acesso à administração de pessoas/auditoria. Acessos excepcionais a documentos e auditoria de operações escolares serão detalhados nos módulos correspondentes.

## Responsabilidades e fronteiras

Na [MD-03](microentregas/MD-03/README.md), o módulo `school` organiza ano/etapa/série/turma e ativação da oferta, reutilizando autenticação e auditoria da MD-02. Somente Diretor administra/consulta este módulo nesta etapa. Oferta disponível é derivada da ativação e da validade administrativa atual; referência cadastrada não certifica autorização real. Capacidade é protegida no banco, sem antecipar matrícula ou financeiro.

Na [MD-04](microentregas/MD-04/README.md), o módulo `people` cadastra pessoas e perfis de aluno, separando filiação, representação legal, responsável financeiro preparatório e autorização de retirada. Direção e Secretaria administram o cadastro; TI não acessa dados pessoais. O módulo não cria matrícula, contrato, cobrança, desconto ou autoridade legal automática.

Na [MD-05](microentregas/MD-05/README.md), o módulo `commercial` registra campanhas por ano letivo, versões de plano com composição exata em centavos e ofertas de turmas sem ocupar vagas. Direção administra a entrega; não há aceite de contrato, matrícula, cobrança, aplicação automática de descontos ou publicação externa.

Na [MD-06](microentregas/MD-06/README.md), o módulo `enrollment` salva e retoma rascunhos com aluno, responsável financeiro vinculado, campanha, turma ofertada, plano, pendências e snapshot da parcela inicial. Direção e Secretaria administram a entrega; o rascunho não ocupa vaga, não confirma matrícula e não gera cobrança.

Na [MD-07](microentregas/MD-07/README.md), o módulo `enrollment` registra a liquidação inicial manual ou a dispensa/negociação formal, confirma a matrícula, ocupa a vaga e gera as obrigações restantes na mesma transação. Na [MD-08](microentregas/MD-08/README.md), registra recebimentos manuais, alocações, créditos e reversões com auditoria e idempotência. Gateway, restituição efetiva, nota fiscal e cancelamento permanecem fora.

Na [MD-09](microentregas/MD-09/README.md), o módulo `enrollment` registra mês de entrada tardia no rascunho, gera apenas competências do mês informado até dezembro e permite negociação da primeira obrigação restante com autorização da Direção, preservando a condição original. Entrada após o dia 10 e proporcionalidade por dias continuam pendentes.

Dados de saúde e restrições judiciais não devem aparecer em telas financeiras ou logs gerais. O financeiro não decide acesso pedagógico; produtos não condicionam matrícula. Suporte técnico não implica autorização irrestrita sobre documentos.

## Dependências e integrações

Retenção e direitos dos titulares abrangem banco, armazenamento de documentos, auditoria, backups e logs. Fornecedores externos exigem avaliação de seus papéis e fluxos de dados. Emissão fiscal pode ocorrer externamente, com referência no registro financeiro.

## Fluxos entre módulos

Confirmação, ocupação da vaga, geração de parcelas ainda não registradas e auditoria ocorrem na mesma transação PostgreSQL, coordenada pela API. Cancelamento libera vaga e registra os ajustes financeiros aplicáveis na mesma transação, sem apagar recebimentos. Restituição efetiva e reversão de erro são movimentos distintos, com atualização transacional dos saldos. Relatórios consultam esses registros diretamente; não existem consumidores ou projeções assíncronas no MVP.

Duplicação de requisições e concorrência sobre vagas/saldos devem ser tratadas no banco. Uploads e devolução externa de dinheiro não participam da atomicidade do PostgreSQL; seus estados e recuperação serão definidos nos respectivos fluxos.

## Fora do MVP

Mantidas as exclusões da [especificação](SPECIFICATION.md#fora-do-mvp). Médio, portal de alunos e integração fiscal não são acrescentados por esta revisão. Kafka, Kafka UI, workers separados, Outbox e retry/DLQ de mensagens ficam fora do MVP.

## Questões abertas

Política de restituição após início das aulas, inventário/retenção de dados e limites transacionais dos movimentos financeiros. Capacidades e autorizações dependem dos documentos reais da escola.
