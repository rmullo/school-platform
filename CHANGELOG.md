# Histórico de alterações

Registrar aqui o resumo das mudanças entregues, vinculando tarefas e decisões. Detalhes de execução e feedback ficam nas tarefas. Não atribuir versão, publicação ou aceite que ainda não ocorreram.

## MD-03 — estrutura escolar — 22/10/2026

- Implementados ano/período letivo, etapa Infantil/Fundamental, referência administrativa de autorização, série e turma com capacidade/ocupação protegidas no PostgreSQL. Cadastro e ativação da oferta separados, sem inferir autorização real.
- API restrita ao Diretor, validação compartilhada, edição com versão/motivo, concorrência e auditoria transacional com estados anterior/posterior. Sem alunos, matrículas ou financeiro.
- Incluída exclusão confirmada em anos, etapas, séries e turmas, com motivo, controle de versão, auditoria e bloqueio de dependências, ocupação e ofertas ativas.
- Página Estrutura escolar com formulários, estados recuperáveis, layout desktop/móvel e integração com auditoria. Sem novas dependências.
- Build/tipos aprovados; 14 unitários, 20 de integração, 11 E2E e smoke aprovados; imagens Docker e migração verificadas. CI remota/Dev Container não executados nesta tarefa.
- [TASK-0006](docs/tasks/TASK-0006-md03-estrutura-escolar.md) e [guia MD-03](docs/microentregas/MD-03/README.md) atualizados. Aceite explícito registrado em 22/10/2026; sem commit, publicação ou avanço para MD-04.

## Transição para MD-03 — estrutura escolar — 21/10/2026

- Registrado o aceite explícito da MD-02 pelo usuário e encerrada a [TASK-0005](docs/tasks/TASK-0005-md02-acesso-e-auditoria.md).
- Aberta a [TASK-0006](docs/tasks/TASK-0006-md03-estrutura-escolar.md) e criado o guia da [MD-03](docs/microentregas/MD-03/README.md), com escopo, critérios, dependências e limitações.
- Nenhum código da MD-03, commit ou publicação foi realizado nesta transição.

## MD-02 — acesso e auditoria básica — 21/10/2026

- A pedido do usuário, criado um Diretor fictício no banco local de desenvolvimento, com senha aleatória fora do repositório; login/perfil e encerramento da sessão de verificação confirmados. Conta disponível para validação manual, sem aceite presumido da MD-02.

- Implementados login Argon2id/JWT, refresh rotativo protegido, logout, contas individuais DIRECTOR/SECRETARY/IT, autorização na API e revogação/desativação de acessos.
- Auditoria transacional, proteção concorrente do último Diretor ativo e bootstrap interativo sem senha padrão. Migração adicional PostgreSQL; sem regras escolares ou mensageria.
- Interface de login, contas/auditoria e navegação por perfil, com painel técnico protegido. React Hook Form/Zod e divisão por páginas; revisão desktop/móvel e teclado.
- Build/typecheck aprovados, 7 unitários, 11 de integração e 9 E2E aprovados; smoke aprovado. Imagens Docker de API, web e inicializador compiladas. CI remota não executada nesta tarefa.
- Setup, Compose/Dev Container e documentação atualizados. [TASK-0005](docs/tasks/TASK-0005-md02-acesso-e-auditoria.md) e [guia MD-02](docs/microentregas/MD-02/README.md). Estado **Em validação**, sem aceite, commit, publicação ou avanço para MD-03.

## Aceite geral e envio autorizado — 15/10/2026

- Usuário aprovou o estado atual do projeto e solicitou envio ao remoto: “tudo ok no projeto. envie para o repositório remoto”. TASK-0001, TASK-0003 e TASK-0004 concluídas; MD-00 já aprovada.
- README, roadmap, guia da MD-01 e índices alinhados ao aceite. MD-02 a MD-15 continuam planejadas; pendências externas da MD-00 preservadas.
- Escopo do envio: fundação MD-01, documentação, testes, skill e AGENTS.md. Versão e publicação verificáveis no histórico Git após a operação.

## Diretrizes de UI, código e testes — 13/10/2026

- Em 15/10/2026, finalizado o registro das verificações: estrutura da skill válida, links conferidos e quatro testes unitários aprovados em 13/10/2026. Tarefa em validação; alterações ainda locais.

- Criada a [skill smartschool-development](.agents/skills/smartschool-development/SKILL.md) no repositório, com referências para UI acessível e consistente, organização do código e testes proporcionais ao comportamento.
- Atualizado o [AGENTS.md](AGENTS.md) existente como ponto de entrada, preservando decisões e limites das microentregas. Guias distinguem ferramentas presentes de configurações futuras.
- Registro: [TASK-0004](docs/tasks/TASK-0004-skill-e-diretrizes-de-desenvolvimento.md). Sem mudança na aplicação ou nas dependências; sem novo commit/publicação.

## MD-01 entregue para validação — 13/10/2026

- Iniciada a fundação executável por solicitação do usuário: [TASK-0003](docs/tasks/TASK-0003-md01-fundacao.md). Monorepo, API, painel de estado, PostgreSQL/Prisma, MinIO, Compose e Dev Container.
- Configuração local com segredos gerados, logs estruturados, contratos de estado e erros padronizados. Build, tipos, quatro testes unitários, dois de integração, quatro de navegador, smoke e persistência após reinício verificados. Compose e inicialização do Dev Container executados.
- Guia em [MD-01](docs/microentregas/MD-01/README.md). Sem regras escolares, mensageria, novo commit ou publicação.

## Aceite da MD-00 — 13/10/2026

- Registrada a aprovação explícita do usuário: “tudo ok no md-00”. [TASK-0002](docs/tasks/TASK-0002-md00-regras-e-exemplos.md) concluída; índices, guia e roadmap alinhados.
- Pendências P-01 a P-07 preservadas; MD-01 permanece planejada. Registro de aceite local, ainda sem novo commit/publicação.

## Roadmap e MD-00 — 08/10/2026

- Preparada a [MD-00](docs/microentregas/MD-00/README.md): fluxo e estados da matrícula, composição financeira, cancelamento, representação, documentos, 19 cenários e cinco esboços de telas. Registro: [TASK-0002](docs/tasks/TASK-0002-md00-regras-e-exemplos.md), em validação pelo usuário.
- Registrada a [decisão 0003](docs/decisions/0003-ingresso-durante-o-ano.md): ingresso tardio com inicial mais meses restantes, sem abatimento automático da inicial. Especificação, PRD e mapa de conformidade alinhados; revisão do contrato real continua pendente.
- Proposto roteiro de microentregas MD-00 a MD-15, com dependências, demonstrações e critérios de aceite.
- Criado registro de tarefas e modelo para documentar trabalho, verificações, feedback e ajustes.
- Alinhadas as orientações do projeto ao ciclo de validação pelo usuário.
- Situação funcional: em validação. Commit e envio ao GitHub solicitados pelo usuário em 08/10/2026; a versão e sua presença no remoto devem ser conferidas no histórico Git. Registro: [TASK-0001](docs/tasks/TASK-0001-plano-de-microentregas.md). Publicar não encerra o aceite das regras pendentes.

## Base documental publicada — 08/10/2026

- Commit `e57c25b`: documentação inicial, AGPL 3.0, adequações legais e planejamento do MVP sem Kafka, publicado na branch main.
- Decisões: [adequação legal](docs/decisions/0001-adequacao-legal.md) e [MVP sem Kafka](docs/decisions/0002-mvp-sem-kafka.md).
- Marco documental, sem implementação disponível. Tarefas anteriores não foram reconstruídas retroativamente.
