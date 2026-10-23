# MD-01 — Fundação executável

Estado: **Concluída**, com aceite do usuário em 15/10/2026: “tudo ok no projeto. envie para o repositório remoto”. Autorizada em 13/10/2026 após aceite da MD-00. Trabalho e evidências: [TASK-0003](../../tasks/TASK-0003-md01-fundacao.md).

## O que esta entrega faz

Disponibiliza uma API NestJS, uma interface React e conexões com PostgreSQL e MinIO. O painel mostra disponibilidade dos serviços e um identificador persistente do ambiente. Há somente uma tabela técnica e um arquivo fictício para verificar persistência. Nenhum cadastro escolar, cobrança ou autenticação foi implementado.

Monorepo com pnpm 11.25.0, Turborepo e TypeScript 5.9.3; Node.js 24 LTS. Prisma 7.10.0 com adapter PostgreSQL. Pacotes compartilhados: contracts (JSON/Zod), database e storage (cliente S3). React Router e TanStack Query atendem navegação/consulta; React Hook Form será incorporado quando houver formulários. Sem mensageria.

## Iniciar com Docker

Pré-requisitos: Git, Node.js 24.19 ou posterior da linha 24, pnpm 11.25.0 e Docker com Compose, motor Linux ativo. No Windows, usar Docker Desktop/WSL2. Reservar recursos suficientes para compilar o MinIO na primeira execução; internet é necessária para imagens/dependências.

Na raiz do repositório:

```sh
node scripts/setup.mjs
docker compose up -d --build --wait
```

A configuração local é criada com senhas aleatórias, sem sobrescrever um .env existente. O Compose instala dependências nas imagens, aplica a migração e inicializa o banco e o bucket privado. A primeira compilação do MinIO demora mais; as seguintes reutilizam cache. Nenhuma imagem da implementação removida é necessária.

| Endereço | Uso |
| --- | --- |
| http://localhost:5173 | Painel para validar esta entrega |
| http://localhost:3333/health | Processo da API |
| http://localhost:3333/ready | Dependências; retorna 503 quando indisponíveis |
| http://localhost:3333/api/docs | Documentação OpenAPI |
| http://localhost:59001 | Console local MinIO; credenciais no .env |
| localhost:55432 | PostgreSQL local |

Portas publicadas somente em 127.0.0.1. O projeto Compose se chama `smartschool` e usa containers com nomes funcionais (`smartschool-database`, `smartschool-file-storage`, `smartschool-school-api` e `smartschool-school-web`). Os volumes locais existentes foram preservados por nome explícito. As credenciais locais são administrativas para desenvolvimento; antes de produção, provisionar credencial S3 restrita, autenticação e os demais controles previstos.

## Testar manualmente

1. Abra o painel e aguarde “Ambiente pronto” com três serviços disponíveis.
2. Copie o identificador do ambiente e clique em “Atualizar estado”; o identificador deve continuar igual.
3. Execute `docker compose restart database file-storage school-api school-web`. Aguarde os serviços se recuperarem e confira o mesmo identificador.
4. Para verificar também o conteúdo do arquivo privado, execute a conferência automática abaixo. O arquivo é fictício e não contém dados pessoais.
5. Execute `docker compose stop file-storage`. Atualize o painel: Arquivos deve aparecer indisponível, e /ready deve retornar 503. /health continua respondendo.
6. Execute `docker compose start file-storage`. Atualize: o ambiente deve voltar a pronto sem recriar dados.
7. Para parar: `docker compose down`. Para voltar: `docker compose up -d --wait`. O identificador e arquivo devem permanecer.

Não usar `down -v`: apaga volumes. Não inserir dados reais. Uma indisponibilidade temporária durante reinício é esperada.

## Desenvolvimento no computador

```sh
pnpm install --frozen-lockfile
pnpm run setup
pnpm build
docker compose up -d --build --wait database file-storage
pnpm db:migrate
pnpm infra:init
pnpm dev
```

Se API e web já estiverem no Compose, pare-as com `docker compose stop api web` antes de iniciar os servidores locais. Mesmas portas não podem ser usadas pelos dois modos. `pnpm dev` recompila a API e atualiza a interface; após alterar pacotes compartilhados, reinicie o comando para recompilá-los.

## Dev Container

1. Execute `docker compose down` se estiver usando a pilha completa. Os volumes são preservados.
2. No VS Code, use “Dev Containers: Reopen in Container”.
3. Aguarde a instalação, build, migração e inicialização do arquivo fictício.
4. No terminal do container, execute `pnpm dev`.
5. Abra a porta 5173 encaminhada pelo VS Code.

O container usa Node/pnpm fixados e volumes separados para dependências Linux. A configuração do Compose aponta para `database` e `file-storage` pelo nome funcional do serviço. O `.env` do computador não substitui essas variáveis. O mount não inclui socket Docker; testes Testcontainers devem ser executados no host ou CI.

## Conferências automatizadas

Com dependências instaladas, build pronto e pilha completa iniciada:

```sh
pnpm typecheck
pnpm test
pnpm test:integration
pnpm smoke
pnpm exec playwright install chromium
pnpm test:e2e
```

Testcontainers cria PostgreSQL descartável e isolado para migração, reconexão, inicialização repetida e rollback. Smoke valida API, prontidão, proxy, Swagger, correlationId e acesso privado ao arquivo. Playwright verifica ambiente disponível, falha/recuperação, dependência indisponível e tela móvel. Resultados reais ficam na tarefa, não são presumidos pelos comandos.

## Diagnóstico e limites

- Motor Docker parado: iniciar Docker Desktop e repetir a subida.
- Porta ocupada: parar apenas o servidor deste projeto que ocupa a porta; não encerrar aplicações de terceiros.
- Configuração inválida: API indica os nomes das variáveis, sem imprimir valores secretos.
- Banco/bucket ausentes: conferir `docker compose logs init`; corrigir configuração e executar `docker compose up -d --wait`. O inicializador preserva o marcador e arquivo existentes.
- Logs: `docker compose logs --tail=80 api`. São JSON, com identificação de requisição; cabeçalhos sensíveis e query strings não são registrados.
- Logs e saúde básicos estão nesta etapa. OpenTelemetry, Prometheus/Grafana e revisão operacional completa continuam previstos; ainda não há painel de observabilidade ou certificação para produção.
- Login/RBAC/auditoria de ações de usuários pertencem à MD-02. A interface presente é uma verificação local, não operação escolar.

Fontes técnicas: [Node LTS](https://nodejs.org/en/about/previous-releases), [Prisma 7](https://docs.prisma.io/docs/guides/upgrade-prisma-orm/v7), [pnpm 11](https://pnpm.io/blog/releases/11.0), [MinIO e versão de fonte](https://github.com/minio/minio/releases/tag/RELEASE.2025-10-15T17-29-55Z).

[Voltar ao roadmap](../../roadmap.md).
