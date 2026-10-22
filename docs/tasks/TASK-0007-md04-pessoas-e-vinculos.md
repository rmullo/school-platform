# TASK-0007 — MD-04: pessoas e vínculos

## Identificação

- Microentrega: MD-04.
- Estado: Em validação.
- Data de criação: 22/10/2026.
- Origem da solicitação: usuário solicitou “desenvolva o md 04”.
- Requisitos/decisões relacionados: RF-06, RF-08, RF-09 e seção Pessoas da especificação vigente.
- Dependências: MD-02 e MD-03 concluídas; somente dados fictícios na demonstração.

## Objetivo e limites

Implementar cadastro protegido de pessoas e o registro separado dos vínculos de um aluno: filiação, representação legal, responsável financeiro/contratante e autorização específica de retirada.

Inclui busca/listagem limitada, correção rastreável, validação de vigência e evidência textual, identificação administrativa de possíveis irmãos e permissões para Direção/Secretaria. Ficam fora desta tarefa matrícula, contrato, cobrança, desconto automático, upload de documentos reais, decisões judiciais completas e dados reais.

## Critérios de aceite

- [x] Pessoa pode ser criada, consultada e corrigida por Direção ou Secretaria, com motivo nas alterações.
- [x] Aluno é uma identidade cadastral contínua e pode ter os vínculos distintos sem mistura de papéis.
- [x] Filiação não concede representação legal; pagamento não concede representação, acesso pedagógico ou autorização de retirada.
- [x] Há no máximo um responsável financeiro ativo por aluno neste cadastro preparatório; a futura matrícula deverá vincular exatamente um contratante por matrícula.
- [x] Vigência e evidência são obrigatórias nos vínculos de representação e autorização específica.
- [x] Possíveis irmãos são apenas sugestão administrativa por filiação ou responsável financeiro; nenhum desconto é aplicado automaticamente.
- [x] API rejeita acesso anônimo/TI e aplica autorização independentemente da interface.
- [x] Dados sensíveis não aparecem em listagens amplas; auditoria não registra dados desnecessários.
- [x] Banco, API, contratos, interface e testes proporcionais estão documentados.
- [x] Documentação, limitações, roteiro manual e resultados reais são atualizados.
- [ ] Aceite explícito do usuário é registrado antes de encerrar a tarefa.

## Decisões e pendências

- Pai e mãe são informações de filiação; não exigir que ambos existam nem presumir composição familiar.
- Representação legal e autorização de retirada são relações próprias, com evidência e vigência, sem importar o conteúdo integral de decisão judicial.
- Responsável financeiro é uma relação administrativa preparatória; a obrigação contratual será criada somente em etapa posterior.
- Não armazenar CPF, documentos de identidade, arquivos judiciais ou dados reais nesta entrega sem definição de finalidade, retenção e acesso.
- Possíveis irmãos não geram desconto, parentesco confirmado ou solidariedade por dívida.

## Trabalho realizado

Em 22/10/2026 foram implementados os modelos Prisma e migração adicional, contratos compartilhados, módulo `people` da API, tela Pessoas e vínculos e auditoria. Direção e Secretaria podem cadastrar/corrigir pessoas, criar perfil de aluno e adicionar filiação, representação, responsável financeiro e autorização de retirada. A interface apresenta possíveis irmãos apenas como sugestão. MD-05, matrícula, contrato e cobrança não foram iniciados.

## Verificações

| Data | Cenário ou comando | Resultado observado | Evidência/limitação |
| --- | --- | --- | --- |
| 22/10/2026 | `pnpm build` | Cinco pacotes compilados | Migração e cliente Prisma gerados |
| 22/10/2026 | `pnpm test` | 14 unitários aprovados | Suite existente preservada |
| 22/10/2026 | `pnpm test:integration` | 25 aprovados, sendo 5 da MD-04 | PostgreSQL isolado: RBAC, vínculos distintos, cardinalidade financeira, vigência, auto vínculo e auditoria |
| 22/10/2026 | `pnpm exec playwright test --workers=1` | 13 aprovados | Fluxo completo anterior e 2 jornadas MD-04; serializado por timeout de conexão do PostgreSQL em execução paralela |
| 22/10/2026 | `pnpm typecheck` / `git diff --check` | Aprovados | Sem erros de tipos ou whitespace |
| 22/10/2026 | Inspeção visual | Captura 1280×900 conferida | Tela de alunos/vínculos sem corte horizontal; dados fictícios removidos pela fixture |

## Roteiro de teste do usuário

- Identificação da entrega: alterações locais da TASK-0007/MD-04; commit e publicação não presumidos.
- Preparação e dados fictícios: subir a pilha com `docker compose up -d --build --wait`, entrar com Secretaria e usar nomes fictícios.
- Passos e resultado esperado: abrir **Pessoas e vínculos**, cadastrar três pessoas, criar um aluno, adicionar filiação e conferir os contadores de papéis; usar Direção/TI para confirmar permissões. Representação, financeiro e retirada são ações separadas.
- Limitações conhecidas: sem matrícula, contrato, cobrança, desconto automático, upload ou dados reais.

## Feedback e ajustes

| Data | Retorno do usuário | Ação tomada ou tarefa vinculada | Situação |
| --- | --- | --- | --- |
| 22/10/2026 | “desenvolva o md 04” | Tarefa aberta e execução autorizada | Em andamento |
| 22/10/2026 | Jornada MD-04 executada | Ajuste de serialização pública e validação E2E concluídos | Em validação |

## Registro de alterações

| Data | Alteração | Motivo |
| --- | --- | --- |
| 22/10/2026 | Escopo e critérios da MD-04 registrados | Preparar execução controlada da microentrega |

## Aceite e referências

- Aceite do usuário: pendente.
- Commit/PR: não criado nesta tarefa até confirmação.
- Publicação: não realizada.
- Pendências: implementação, verificações e validação do usuário.
