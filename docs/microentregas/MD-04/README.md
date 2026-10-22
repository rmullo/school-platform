# MD-04 — Pessoas e vínculos

Estado: **Concluída**. Implementação autorizada pelo usuário em 22/10/2026 e aceita explicitamente com “4 aceita”, registrada na [TASK-0007](../../tasks/TASK-0007-md04-pessoas-e-vinculos.md). MD-05 segue em tarefa própria.

## Escopo

Cadastro protegido de pessoas, aluno e vínculos administrativos separados: filiação, representação legal, responsável financeiro/contratante e autorização específica de retirada.

Não inclui matrícula, contrato, cobrança, descontos, upload de documentos reais, decisões judiciais completas, dados reais ou portal de alunos.

## Regras desta etapa

- Aluno mantém identidade cadastral contínua entre anos, sem retenção ilimitada de dados.
- Pai e mãe são informações de filiação; a ausência de um deles não bloqueia o cadastro.
- Filiação, representação legal, responsável financeiro e autorização de retirada são vínculos diferentes.
- Um responsável financeiro ativo por aluno neste cadastro preparatório; a matrícula futura terá exatamente um contratante próprio.
- Pagamento não concede representação legal, acesso pedagógico ou autorização de retirada.
- Possíveis irmãos são sugestão para conferência da Secretaria; nenhum desconto é automático.
- Direção e Secretaria administram os cadastros; TI não acessa dados pessoais pela interface ou API.
- Dados e exemplos são fictícios e não representam base para operação real.

## Como executar e testar

1. Subir a pilha sem apagar volumes: `docker compose up -d --build --wait`.
2. Entrar com uma conta de Secretaria ou Direção e abrir **Pessoas e vínculos**.
3. Em **Pessoas**, cadastrar pessoas fictícias com contato opcional e corrigir uma delas informando motivo.
4. Em **Alunos e vínculos**, transformar uma pessoa em aluno e adicionar filiação. Conferir que representação, financeiro e retirada aparecem como ações separadas.
5. Adicionar representação legal, responsável financeiro e autorização de retirada com evidência e vigência. O segundo responsável financeiro para o mesmo aluno deve ser recusado.
6. Repetir com TI: menu ausente, rota redirecionada e API protegida. Em **Contas e auditoria**, conferir ações e motivos sem dados desnecessários.

## Contratos e API

| Método | Rota | Uso |
| --- | --- | --- |
| GET | `/api/v1/people` | Visão limitada de pessoas, alunos, vínculos e sugestões de possíveis irmãos |
| POST | `/api/v1/people` | Cadastrar pessoa |
| PUT | `/api/v1/people/:id` | Corrigir pessoa com `{version,reason,data}` |
| POST | `/api/v1/people/students` | Criar perfil de aluno para uma pessoa |
| POST | `/api/v1/people/students/:studentId/:resource` | Criar `parentage`, `representation`, `financial` ou `pickup` |
| PUT | `/api/v1/people/students/:studentId/:resource/:id` | Corrigir vínculo com versão e motivo |

Todas as escritas exigem sessão de Direção/Secretaria, identificação do cliente web e origem autorizada. Não há matrícula, contrato, cobrança, desconto automático, upload ou dados reais nesta etapa.

## Referências

- [Especificação — Pessoas](../../SPECIFICATION.md#pessoas)
- [PRD — RF-06 e RF-08](../../prd.md)
- [Roadmap](../../roadmap.md)

## Estado

Critérios, alterações, verificações e aceite estão registrados na [TASK-0007](../../tasks/TASK-0007-md04-pessoas-e-vinculos.md). A MD-05 foi autorizada em tarefa própria; não avançar para MD-06 sem nova orientação e aceite.
