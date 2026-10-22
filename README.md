# SmartSchool

Sistema interno de gestão escolar, com foco em matrículas e organização administrativa e financeira.

**Momento atual: MD-00 a MD-06 aprovadas; MD-07 permanece planejada.**

## Executar a fundação local

Com Node.js 24 e Docker Desktop ativo, na raiz do projeto:

```sh
node scripts/setup.mjs
docker compose up -d --build --wait
```

Abra http://localhost:5173. A primeira compilação do MinIO pode demorar alguns minutos. O [guia da MD-01](docs/microentregas/MD-01/README.md) reúne instalação, Dev Container, testes e recuperação. A fundação foi validada pelo usuário; as operações escolares serão desenvolvidas nas próximas microentregas.

A MD-02 acrescenta login e exige criar o primeiro Diretor pelo procedimento interativo do [guia de acesso](docs/microentregas/MD-02/README.md). Não há senha padrão. Execute novamente o setup para acrescentar a configuração de autenticação a ambientes anteriores.

## Objetivo do projeto

A [MD-03](docs/microentregas/MD-03/README.md) acrescenta a área **Estrutura escolar** para o Diretor: anos, etapas, séries, turmas, capacidade e ativação controlada da oferta. Os dados de demonstração não representam autorização escolar real.

A [visão](docs/vision.md) registra contexto, princípios e limites iniciais. A [especificação vigente](docs/SPECIFICATION.md) incorpora as adequações legais autorizadas em 07/10/2026 para a escola privada de Assaré/CE, com infantil e fundamental; médio permanece futuro.

## Como vamos trabalhar

O usuário indicará o assunto de cada etapa. Os detalhes de produto, regras e decisões serão organizados conforme essa orientação. Em 07/10/2026, a implementação anterior foi removida a pedido do usuário; a documentação foi preservada. Em 13/10/2026, o usuário autorizou retomar código apenas para a MD-01.

## Arquitetura do MVP

O planejamento vigente mantém React, uma API NestJS modular e PostgreSQL, com MinIO para arquivos locais. Operações centrais usam transações no banco; relatórios consultam os dados diretamente. Auditoria, segurança e prevenção de duplicidade permanecem requisitos.

Kafka, Kafka UI, workers separados e Outbox foram adiados, conforme a [decisão 0002](docs/decisions/0002-mvp-sem-kafka.md). Kubernetes e AWS ficam para etapa posterior. A MD-01 implementa somente a fundação desse desenho.

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [Visão](docs/vision.md) | Missão, problema, princípios e escopo |
| [Requisitos de produto](docs/prd.md) | O que o sistema precisa fazer e por quê |
| [Módulos](docs/modulos.md) | Responsabilidades e relações entre áreas |
| [Cadastros](docs/cadastros.md) | Dicionário de dados |
| [Mapa normativo e documental](docs/compliance.md) | Fontes e requisitos a verificar |
| [Conformidade](docs/conformidade.md) | Rastreabilidade entre exigências e evidências |
| [Decisões técnicas](docs/decisions/README.md) | Registros individuais de decisões |
| [Reuniões e conversas](docs/reunioes/README.md) | Discussões, decisões e pendências |
| [Roadmap](docs/roadmap.md) | Microentregas, dependências e testes do usuário |
| [Tarefas](docs/tasks/README.md) | Trabalho realizado, verificações, feedback e ajustes |
| [Histórico de alterações](CHANGELOG.md) | Mudanças por entrega e versão |
| [Governança](GOVERNANCE.md) | Como o trabalho é conduzido |
| [Contribuição](CONTRIBUTING.md) | Como organizar alterações |
| [Segurança](SECURITY.md) | Requisitos de acesso, privacidade e incidentes; operação pendente |
| [Conduta](CODE_OF_CONDUCT.md) | Espaço para regras de colaboração |
| [Licenciamento](docs/licensing.md) | GNU AGPL 3.0 |

O [índice completo](docs/README.md) indica a situação de cada documento e os modelos disponíveis.

## Referência de organização

A estrutura segue o modelo documental do [OpenClinic](https://github.com/Iniciativa-OpenClinic/OpenClinic), adaptado ao SmartSchool. A [revisão consultada e as adaptações](docs/README.md#modelo-de-organização-utilizado) estão registradas no índice.

## Revisão legal e histórico

A [decisão 0001](docs/decisions/0001-adequacao-legal.md) registra as regras substituídas. Parcela inicial integra o total contratado; material coletivo não gera cobrança obrigatória; cancelamentos contemplam créditos e restituições. O [mapa normativo](docs/compliance.md) e a [matriz](docs/conformidade.md) distinguem requisitos corrigidos de contrato, documentos locais e controles ainda a validar.

A [especificação e o histórico](docs/README.md#especificação-e-histórico) mantêm a rastreabilidade. Relatos da implementação removida não indicam funcionalidades disponíveis. A revisão documental não certifica conformidade da escola.

## Licença

O SmartSchool é software livre, licenciado sob a **GNU Affero General Public License, versão 3** (`AGPL-3.0-only`). A licença abrange o código e a documentação original do projeto. Materiais de terceiros mantêm suas próprias licenças.

O uso comercial é permitido. A distribuição e a oferta de versões modificadas pela rede devem cumprir as obrigações de disponibilização do código correspondente previstas na licença. Consulte o texto completo em [LICENSE](LICENSE) e o [registro da decisão](docs/licensing.md).

## Idioma

A documentação é escrita em português.
