# TASK-0003 — MD-01: fundação executável

- Estado: Concluída.
- Criação: 13/10/2026.
- Origem: usuário solicitou “quero md-01”, após aprovar a MD-00.
- Escopo: monorepo pnpm/Turborepo, API NestJS, React/Vite, contratos compartilhados, PostgreSQL/Prisma, MinIO, Compose, Dev Container, configuração, logs, tela de estado e verificações reproduzíveis.
- Limites: sem regras escolares, autenticação (MD-02), Kafka, filas, workers, Kubernetes ou implantação AWS. Não alterar dados/volumes de outras aplicações.

## Critérios de aceite

- [x] Instalação e build reproduzíveis com versões fixadas e lockfile.
- [x] API e interface executáveis; estado das dependências e erros compreensíveis.
- [x] PostgreSQL e MinIO saudáveis; migração e armazenamento privado verificados.
- [x] Reinício preserva dados fictícios no banco e arquivo de exemplo.
- [x] Docker Compose e Dev Container validados.
- [x] Testes, limitações e passos de teste manual documentados.
- [x] Aceite explícito do usuário. Aprovação geral em 15/10/2026: “tudo ok no projeto. envie para o repositório remoto”.

## Trabalho e verificações

Registro aberto antes da implementação. Docker inicialmente parado, iniciado para os testes. Implementados monorepo e lockfile; apps/api e apps/web; packages/contracts, database e storage; migração técnica FoundationState; inicializador idempotente com arquivo fictício privado; Compose, Dev Container, testes e workflow de CI.

API com /health, /ready, /api/v1/status, OpenAPI, correlationId, logs JSON e erros padronizados. Interface com disponibilidade, atualização manual/automática, falha/recuperação e identificador persistente. Banco e MinIO têm volumes próprios do projeto smartschool-md01. Portas publicadas apenas em 127.0.0.1. As aplicações não dependem de arquivos ou imagens da implementação removida.

README, especificação, roadmap, índices, colaboração e CHANGELOG atualizados. Guia de instalação e roteiro manual: [MD-01](../microentregas/MD-01/README.md).

### Evidências de 13/10/2026

| Verificação executada | Resultado |
| --- | --- |
| Instalação com lockfile e pnpm 11.25.0 | Concluída no host, imagem Docker e Dev Container |
| Build TypeScript/Vite/Turborepo e verificação de tipos | Cinco pacotes compilados; verificação de tipos aprovada |
| Testes unitários | 4 aprovados: configuração obrigatória, validação sem exposição de segredo e contrato de estado |
| Testcontainers/PostgreSQL 17.9 | 2 aprovados: migração, inicialização repetida/reconexão e rollback da transação técnica |
| Compose completo | PostgreSQL, MinIO, API e web saudáveis; inicializador concluído sem erro |
| Dev Containers CLI 0.89.0 | Criação e postCreate concluídos; pnpm dev iniciou API e Vite; prontidão e proxy responderam 200 dentro do container |
| Smoke integrado | API, dependências, proxy, Swagger, correlationId e leitura autenticada do arquivo aprovados; acesso anônimo ao arquivo retornou 403 |
| Playwright/Chromium | 4 aprovados: ambiente pronto, falha/recuperação, dependência indisponível e largura móvel |
| Inspeção visual | Captura móvel conferida, sem corte horizontal; evidência local ignorada em test-results/md01-mobile.png |
| Falha real e recuperação | MinIO parado: /ready retornou 503, /health 200, estado de armazenamento indisponível; serviço restaurado |
| Reinício dos quatro serviços | Identificador do banco e conteúdo do arquivo preservados; prontidão recuperada |
| Erro HTTP | Endereço inexistente retornou 404 em application/problem+json |
| Documentação e Git | Links internos/âncoras e formatação conferidos; .env, dependências e cliente gerado ignorados |

### Ajustes encontrados durante a validação

- Resíduos locais ignorados da versão removida impediam a geração do Prisma; preservados em .tools e removido apenas um diretório antigo vazio de migração.
- Ajustada a política de scripts de instalação para pnpm 11 e mantida versão estável do Prisma 7, sem adotar o candidato Prisma 8.
- Corrigidos tipos de componentes MUI e anotação do cliente Prisma; adicionados OpenSSL à imagem e diretório Git confiável específico no Dev Container.
- Build mostra aviso não bloqueante de bundle web acima de 500 kB. A divisão das telas deve acompanhar as próximas funcionalidades; não foi ocultado o aviso.

CI foi configurada, mas ainda não executada no GitHub. Não houve teste com dados reais, validação de regras escolares ou certificação para produção. Login/RBAC/auditoria funcional ficam na MD-02; OpenTelemetry e painéis de observabilidade permanecem requisitos posteriores. MinIO local é compilado da fonte oficial fixa já prevista na especificação.

## Feedback e histórico

| Data | Registro | Efeito |
| --- | --- | --- |
| 13/10/2026 | “quero md-01” | Autoriza implementar somente a fundação prevista no roadmap |
| 13/10/2026 | Fundação implementada e verificada | Entregue para teste do usuário; sem iniciar MD-02 |
| 15/10/2026 | “tudo ok no projeto. envie para o repositório remoto” | MD-01 aprovada; commit e envio do estado atual a origin/main autorizados |

## Entrega

Disponível localmente em http://localhost:5173. O [roteiro manual](../microentregas/MD-01/README.md#testar-manualmente) orienta atualização, reinício, falha e recuperação. A pilha completa permanece iniciada; o container de desenvolvimento foi usado para validação e pode ser reaberto pelo VS Code.

Aceite do usuário registrado em 15/10/2026. Commit e envio a origin/main autorizados nessa data; consultar o histórico Git para a versão e confirmação de publicação. Pendências de negócio da MD-00 continuam preservadas.
