# TASK-0020 — Nomes funcionais da stack e dos containers

## Identificação

- Microentrega: ajuste transversal de infraestrutura local.
- Estado: Em validação.
- Data de criação: 22/10/2026.
- Origem da solicitação: pedido do usuário para substituir nomes técnicos/numerados por nomes amigáveis e funcionais.
- Responsável pela execução: agente Codex.
- Requisitos/decisões relacionados: composição local da MD-01; preservação dos volumes existentes; não publicar nem usar dados reais.
- Dependências: `compose.yaml`, Dev Container e proxy local.

## Objetivo e limites

Renomear a stack local, seus serviços e containers para nomes sem números e que descrevam melhor sua função, mantendo portas, rede interna, volumes e dados locais. A alteração não muda a configuração de negócio nem publica a aplicação.

## Critérios de aceite

- [x] O projeto Compose usa o nome `smartschool`.
- [x] Os serviços e containers principais usam nomes funcionais sem números.
- [x] API, proxy, Dev Container e documentação apontam para os novos nomes.
- [x] Os volumes existentes permanecem vinculados por nomes explícitos; nenhum volume é removido.
- [ ] Validação do usuário registrada.

## Trabalho realizado

- Renomeados os serviços para `database`, `file-storage`, `environment-initializer`, `school-api` e `school-web`.
- Definidos nomes explícitos para os containers, incluindo `smartschool-development` no Dev Container.
- Atualizados `DATABASE_URL`, `S3_ENDPOINT`, dependências entre serviços, proxy Nginx, Dev Container e roteiro da MD-01.
- Mantidos os volumes físicos locais existentes (`smartschool-md01_postgres-data` e `smartschool-md01_minio-data`) para evitar perda ou desassociação dos dados já carregados.

## Verificações

| Data | Cenário ou comando | Resultado observado | Evidência/limitação |
| --- | --- | --- | --- |
| 22/10/2026 | `docker volume ls --format '{{.Name}}'` | Volumes existentes identificados | Foram preservados por nome explícito; não houve remoção |
| 22/10/2026 | `docker compose config --services` e `docker compose config --volumes` | Passou; serviços funcionais e volumes declarados foram resolvidos | A configuração não inicia nem recria containers |
| 22/10/2026 | `docker compose -f compose.yaml -f .devcontainer/compose.dev.yaml config --services` | Passou; o Dev Container resolve `database`, `file-storage` e `dev` | Serviços de perfil completo não foram iniciados |
| 22/10/2026 | Conferência dos `container_name` | Passou; nomes principais não contêm números | Os nomes físicos históricos dos volumes preservam `md01` por compatibilidade |
| 22/10/2026 | `git diff --check` | Passou; nenhuma falha de whitespace | Não substitui o teste manual de subida da stack |

## Roteiro de teste do usuário

- Versão/commit ou identificação da entrega: a preencher após a validação.
- Preparação e dados fictícios: executar `docker compose config --services`; não é necessário apagar volumes.
- Passos e resultado esperado: executar `docker compose up -d --wait` e conferir os nomes com `docker ps --format '{{.Names}}'`; os containers devem aparecer com o prefixo `smartschool-` e sem números.
- Limitações conhecidas: os nomes físicos históricos dos volumes continuam contendo `md01` para preservar os dados locais existentes; isso não afeta o nome da stack nem dos containers.

## Feedback e ajustes

| Data | Retorno do usuário | Ação tomada ou tarefa vinculada | Situação |
| --- | --- | --- | --- |

## Registro de alterações

| Data | Alteração | Motivo |
| --- | --- | --- |
| 22/10/2026 | Renomeação funcional da stack, serviços e containers | Melhorar identificação no ambiente local e remover números dos nomes principais |

## Aceite e referências

- Aceite do usuário: pendente.
- Commit/PR: `6628bac` (`chore(infra): use friendly local stack names`).
- Publicação: não realizada.
- Pendências: validação do usuário; eventual renomeação futura dos volumes depende de migração explícita e não faz parte desta tarefa.
