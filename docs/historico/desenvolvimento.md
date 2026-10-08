# Guia técnico anterior

> Arquitetura substituída pela [decisão 0002](../decisions/0002-mvp-sem-kafka.md): Kafka e workers não integram o MVP vigente. Conteúdo preservado apenas como histórico.

> Registro histórico da implementação removida em 07/10/2026. Os comandos e serviços abaixo descrevem a etapa anterior e não estão disponíveis no repositório documental atual.

Fundação executável do MVP de gestão escolar — **Fase 1 somente**.
A especificação aprovada está em [SPECIFICATION.md](../SPECIFICATION.md). A recuperação disponível da conversa anterior foi preservada; os anexos citados não chegaram a este ambiente.

## Requisitos
- Docker Desktop com engine Linux / Compose v2 ou superior, iniciado.
- Node.js 24 LTS e pnpm **10.34.6** para ferramentas locais.
- Recomenda-se disponibilizar 8 GB de RAM e 15 GB de disco ao Docker. O primeiro build baixa dependências e compila o MinIO.
- Com Corepack disponível: `corepack enable` e `corepack prepare pnpm@10.34.6 --activate`. Confira `pnpm --version`.

## Subir tudo
Execute na pasta school-platform:
```sh
node scripts/setup.mjs
docker compose up -d --build --wait
docker compose ps --all
```
O setup cria .env com senhas locais aleatórias e preserva arquivos existentes. Não é necessário instalar dependências no host para subir o Compose.
A inicialização cria banco/tabelas técnicas, seis tópicos Kafka (três de domínio e três DLQ) e bucket privado. Os jobs migrate, kafka-volume-init, kafka-init e minio-init devem terminar com código 0; os nove serviços permanentes devem ficar saudáveis. O job kafka-volume-init ajusta a propriedade do volume para o broker rodar sem root.
O build MinIO vem do código oficial RELEASE.2025-10-15T17-29-55Z porque as antigas imagens oficiais não estão disponíveis. [Contexto oficial](https://github.com/minio/minio). É uma dependência de desenvolvimento local; AWS usará S3.

| Serviço | Endereço local |
| --- | --- |
| Interface | http://localhost:5173 |
| API / documentação | http://localhost:3000/docs |
| API viva / pronta | http://localhost:3000/health · /ready |
| Billing worker | http://localhost:3001/ready |
| Projection worker | http://localhost:3002/ready |
| Outbox publisher | http://localhost:3003/ready |
| Kafka UI | http://localhost:8080 |
| MinIO API / console | http://localhost:9000 · http://localhost:9001 |
| PostgreSQL | localhost:5432 |
| Kafka, clientes no host | localhost:9092 |

Console MinIO usa MINIO_ROOT_USER e MINIO_ROOT_PASSWORD do .env. Todos os ports publicados estão restritos a 127.0.0.1. Kafka usa PLAINTEXT e fator de replicação 1 somente para desenvolvimento.
As aplicações dentro do Compose usam postgres:5432, kafka:19092, minio:9000. Não usar localhost:9092 dentro de containers.

## Validar
```sh
pnpm install --frozen-lockfile
pnpm check
pnpm smoke
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:integration
```
- check: ESLint, tipos, testes unitários e build dos apps/pacotes.
- smoke: readiness dos quatro processos, correlationId, interface, OpenAPI, migrations, tópicos, ida/volta Kafka e escrita/leitura S3 com negação de acesso anônimo.
- E2E: navegador real desktop/mobile, conexão normal, atualização e indisponibilidade.
- integration: Testcontainers com PostgreSQL real (rollback) e Kafka KRaft isolado (produção/consumo). Requer Docker. O módulo Testcontainers Kafka usa imagem Confluent; o Compose usa Apache Kafka.
- smoke cria e remove apenas tópico/objeto técnico com identificador único; não escreve eventos escolares.
Veja [docs/VALIDATION.md](VALIDATION.md) para os resultados desta entrega.

## Desenvolvimento no host
Pare os containers das aplicações para liberar portas:
```sh
docker compose stop web api billing-worker projection-worker outbox-publisher
pnpm infra:up
pnpm install --frozen-lockfile
pnpm build
pnpm db:migrate
pnpm dev
```
API e workers leem ../../.env; Prisma também. O Vite encaminha /api, /health e /ready à API em localhost:3000. Bibliotecas compartilhadas compilam com pnpm build; execute novamente após alterá-las. Os apps usam watch.
Após alterações no schema: crie migration com Prisma, revise SQL e versione migration. Não usar db push em ambientes compartilhados.

## VS Code Dev Container
Abra esta pasta no VS Code e execute “Dev Containers: Reopen in Container”.
Antes de alternar do Compose completo, pare web/api/workers como acima.
O Dev Container inicia a infraestrutura, instala dependências, compila e aplica migrations; depois execute `pnpm dev` no terminal integrado.
Volumes separam node_modules de Linux dos módulos do host Windows. Não há socket Docker montado: testes Testcontainers devem rodar no host ou no CI.
O initializeCommand usa Node no host para gerar .env. Extensão requerida: Dev Containers.
PostCreate usa o mesmo lockfile e pnpm do Compose.

## Estrutura
- apps/api: NestJS, Helmet, CORS, correlationId, OpenAPI, /health, /ready e /metrics.
- apps/web: React/Vite, Router, Query, MUI. RHF e Zod disponíveis para formulários futuros.
- apps/billing-worker, projection-worker, outbox-publisher: esqueletos separados com conexões, saúde, métricas e SIGTERM.
- packages/database: Prisma, migration técnica inicial, adapter PostgreSQL.
- packages/event-contracts: envelope Zod e roteamento dos sete tipos aprovados.
- packages/config: configuração validada, falha sem exposição de segredos.
- packages/shared, runtime, eslint-config: tipos, infraestrutura e padrões compartilhados.
- infrastructure/docker: imagens Node e Nginx sem root, MinIO construído do código oficial.
- infrastructure/kubernetes e terraform: documentação de preparação; implantação futura.
- tests e scripts: validações repetíveis.

## Limites intencionais
Workers **não processam tópicos de negócio** nesta fase. OutboxEvent/ProcessedEvent são tabelas técnicas reservadas, não garantias de entrega/idempotência já implementadas.
Sem usuários, autenticação, dados escolares, regras financeiras, retry ou envio a DLQ. Sem promessas de sistema pronto para produção.
Logs JSON e métricas /metrics estão disponíveis. OpenTelemetry, servidor Prometheus, Grafana e auditoria serão integrados na fase prevista.
Imagens usam usuário sem root, env, stdout e encerramento por sinais. A imagem inicial Node inclui ferramentas para migrations e desenvolvimento; imagens mínimas por serviço ficam para a preparação de produção.

## Operação e diagnóstico
```sh
docker compose logs --tail=100 api billing-worker projection-worker outbox-publisher
docker compose logs --tail=100 migrate kafka-init minio-init
docker compose stop
docker compose start
docker compose down
```
down preserva os volumes. **Não execute down -v** sem intenção de apagar o banco, eventos e arquivos locais.
Se alterar senha do PostgreSQL depois de inicializar o volume, alterar o .env sozinho não muda a senha no banco.
Se houver conflito de portas, personalize as variáveis de .env e mantenha DATABASE_URL, KAFKA_BROKERS, WEB_ORIGIN e S3_ENDPOINT coerentes. No modo Vite host, adapte também seu proxy quando mudar API_PORT.
Não versionar .env, anexos pessoais, comprovantes ou dumps.

Referências técnicas: [Node LTS](https://nodejs.org/en/about/previous-releases), [Prisma 7](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/introduction), [Kafka Docker](https://kafka.apache.org/42/getting-started/docker/).
