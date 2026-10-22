# Organização dos módulos

> Revisão parcial de 07/10/2026: adequação legal e simplificação do MVP sem Kafka. MD-02 implementada e em validação em 21/10/2026: users/audit e acesso básico; os demais módulos escolares permanecem planejamento.

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
