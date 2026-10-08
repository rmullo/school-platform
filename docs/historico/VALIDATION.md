# Validação da Fase 1

> Arquitetura substituída pela [decisão 0002](../decisions/0002-mvp-sem-kafka.md): Kafka e workers não integram o MVP vigente. Conteúdo preservado apenas como histórico.

> Registro histórico. A implementação validada abaixo foi removida em 07/10/2026 por solicitação do usuário. Estes resultados não descrevem funcionalidades presentes no repositório atual.

Execução local em 29/09/2026, Windows + Docker Desktop (engine Linux), Node 24 e pnpm 10.34.6.

| Verificação | Resultado |
| --- | --- |
| pnpm install --frozen-lockfile | Aprovado no host, imagem Linux e Dev Container |
| pnpm check | ESLint, tipos (incluindo scripts/testes), 11 testes unitários e build aprovados |
| Docker Compose | Nove serviços permanentes saudáveis e quatro jobs de inicialização concluídos |
| Prisma | Cliente gerado, migration técnica aplicada; reaplicação sem alterações pendentes |
| Smoke completo | API, três workers, interface, OpenAPI e correlationId aprovados |
| Kafka Compose | Três tópicos de domínio + três DLQ presentes; mensagem publicada e consumida em tópico temporário |
| Storage | Upload, download e remoção de objeto temporário; acesso anônimo negado (403) |
| Testcontainers | 2 testes aprovados: rollback PostgreSQL e roundtrip Kafka KRaft |
| Playwright | 4 testes aprovados: desktop e mobile, conexão e indisponibilidade; sem overflow horizontal |
| Inspeção visual | Tela inicial inspecionada em 1440 × 1000 |
| Dependência indisponível | PostgreSQL parado: /health 200 e /ready 503 com postgres=down; banco restaurado |
| Dev Container | Imagem construída; instalação, build e migration aprovados; pnpm dev com readiness 200 em 3000, 3001, 3002, 3003 e proxy Vite em 5173 |
| CI | Workflow criado; execução remota ainda não realizada |

## Ajustes identificados durante a validação
- Imagens oficiais MinIO indisponíveis: build da release fixa do código oficial; nenhuma substituição de produto.
- Volume Kafka inicial requer propriedade do usuário 1000: job dedicado ajusta o volume antes do broker.
- Container Node precisa de OpenSSL para Prisma CLI.
- Testcontainers com Confluent 7.9.0 esbarrou na validação do endereço do controller; 7.9.2 passou. Compose utiliza Apache Kafka 4.2.0.
- Downloads iniciais de imagens exigem margem de tempo; testes isolados têm limite de dez minutos.
- Dev Container usa volumes próprios para node_modules e cache pnpm; variáveis de conexão são repassadas pelo Turborepo.
- Dependências do host e do container não dependem de alterações globais nas ferramentas instaladas.

## Limites e observações
A interface é uma página de estado da fundação, sem dados fictícios de alunos ou financeiro. Workers não consomem eventos escolares.
JWT/RBAC, regras de domínio, processamento Outbox/idempotente, retry/DLQ, OpenTelemetry e dashboards ainda não são funcionalidades implementadas. Consulte a sequência aprovada na especificação.
O Dev Container foi testado pela sua imagem/receita e comandos de ciclo de vida; a interface gráfica do VS Code não foi automatizada.
KafkaJS 2.2.4 em Node 24 emite um aviso de timer negativo na conexão; as conexões e os testes de produção/consumo passaram. O aviso não foi suprimido. Reavaliar a biblioteca ao implementar os consumidores.
Vite informa bundle inicial de aproximadamente 531 KB (165 KB gzip); divisão por funcionalidades poderá ser aplicada quando houver módulos de produto.
Os anexos originais e os trechos mais antigos da conversa não estavam acessíveis; isso não impede a Fase 1, mas impede afirmar que seus detalhes documentais foram conferidos.
Volumes e .env locais foram preservados. Nenhum recurso AWS ou implantação pública foi criado.
