# Documentação do SmartSchool

**Etapa atual:** MD-02 em validação, autorizada em 21/10/2026; aceite pendente. MD-00 e MD-01 aprovadas. Adequação legal e simplificação sem Kafka preservadas. Nenhuma conformidade operacional está certificada.

## Documentos

| Documento | Finalidade | Situação nesta etapa |
| --- | --- | --- |
| [vision.md](vision.md) | Missão, problema, princípios, público e escopo | Parcial: contexto, princípios e limites revisados |
| [prd.md](prd.md) | Requisitos do produto e critérios de aceite | Parcial: RF-01 a RF-13 e critérios transacionais sem Kafka |
| [modulos.md](modulos.md) | Responsabilidades e relações entre módulos | Parcial: fronteiras e fluxos afetados pela revisão |
| [cadastros.md](cadastros.md) | Dicionário dos dados e relacionamentos | Parcial: conceitos e restrições; campos ainda a detalhar |
| [compliance.md](compliance.md) | Fontes normativas e documentos da escola | Fontes, correções incorporadas e enquadramentos pendentes |
| [conformidade.md](conformidade.md) | Matriz de exigências, requisitos e evidências | Requisitos documentados; evidências contratuais e operacionais pendentes |
| [decisions/README.md](decisions/README.md) | Índice de decisões individuais | Decisões 0001 a 0003 registradas; modelo disponível |
| [reunioes/README.md](reunioes/README.md) | Registros de reuniões e conversas | Índice e modelo preparados |
| [roadmap.md](roadmap.md) | Caminho de desenvolvimento e testes do usuário | MD-00 e MD-01 concluídas; MD-02 em validação; MD-03 a MD-15 planejadas |
| [MD-00](microentregas/MD-00/README.md) | Fluxo, estados, cálculos, cenários e esboços de telas | Aprovada em 13/10/2026; P-01 a P-07 permanecem abertas |
| [MD-01](microentregas/MD-01/README.md) | Fundação executável, setup e testes | Aprovada em 15/10/2026; TASK-0003 concluída |
| [MD-02](microentregas/MD-02/README.md) | Acesso, perfis, sessões e auditoria básica | Em validação; TASK-0005 |
| [tasks/README.md](tasks/README.md) | Registro de tarefas, testes e ajustes | TASK-0001 a TASK-0004 concluídas; TASK-0005 em validação |
| [CHANGELOG](../CHANGELOG.md) | Resumo das alterações e referências de versão | Atualização a cada entrega |
| [licensing.md](licensing.md) | Decisão de licenciamento | AGPL 3.0 aprovada em 07/10/2026 |
| [assets/README.md](assets/README.md) | Recursos visuais da documentação | Pasta reservada |

## Colaboração

Para desenvolvimento, consultar [AGENTS.md](../AGENTS.md) e a [skill do projeto](../.agents/skills/smartschool-development/SKILL.md), com guias específicos de UI, código e testes. Trabalho registrado na [TASK-0004](tasks/TASK-0004-skill-e-diretrizes-de-desenvolvimento.md).

[Governança](../GOVERNANCE.md) · [Contribuição](../CONTRIBUTING.md) · [Segurança](../SECURITY.md) · [Conduta](../CODE_OF_CONDUCT.md)

## Especificação e histórico

- [SPECIFICATION.md](SPECIFICATION.md): especificação vigente, com as adequações legais e a arquitetura simplificada autorizadas.
- [reference-conversation.json](reference-conversation.json): conteúdo recuperado da conversa de origem.
- [histórico técnico](historico/README.md): registros da validação, guia de desenvolvimento e notas de infraestrutura da implementação removida.

Histórico e conversa recuperada permanecem como fontes. As revisões autorizadas prevalecem sobre regras antigas, conforme as decisões [0001](decisions/0001-adequacao-legal.md) e [0002](decisions/0002-mvp-sem-kafka.md). Nenhum registro substitui os anexos originais ausentes.

O código, os testes executáveis, os manifestos de dependências e as configurações de infraestrutura foram removidos em 07/10/2026. A fundação foi retomada somente na MD-01, autorizada em 13/10/2026. Os documentos históricos não são instruções executáveis para o estado atual do repositório; usar o guia da MD-01. Caches locais da instalação anterior são ignorados pelo Git e não fazem parte do conteúdo preparado para publicação.

## Modelo de organização utilizado

Referência: [Iniciativa-OpenClinic/OpenClinic](https://github.com/Iniciativa-OpenClinic/OpenClinic/tree/c6627a1ba468bfefbf11562d9064a1e9ea9789c8), revisão `c6627a1ba468bfefbf11562d9064a1e9ea9789c8`, consultada em 06/10/2026.

Mantivemos a separação entre visão, produto, módulos, dados, decisões, reuniões e documentos de colaboração. O conteúdo será próprio do SmartSchool.

| Elemento da referência | Adaptação para o SmartSchool |
| --- | --- |
| README com mapa da documentação | [README do projeto](../README.md) e este índice |
| docs/vision.md, prd.md, modulos.md e cadastros.md | Mesmos nomes e papéis, com conteúdo a desenvolver |
| docs/decisions/ e docs/reunioes/ | Índices e modelos, sem importar decisões ou atas do OpenClinic |
| docs/compliance.md | Mapa de requisitos legais, fontes e adequações ao contexto escolar |
| docs/conformidade-sbis.md | docs/conformidade.md; nenhuma certificação médica foi adotada |
| docs/licensing.md e LICENSE | Decisão própria do SmartSchool: AGPL 3.0, aprovada em 07/10/2026 |
| docs/assets/logo.png | Pasta reservada, sem reutilizar o logotipo |
| Documentos de colaboração e modelos de Issue/PR | Estruturas adaptadas, sem nomes, contatos ou políticas do OpenClinic |
| .github/CODEOWNERS | Não criado: responsáveis e contas do SmartSchool não foram indicados |

[Voltar à apresentação do projeto](../README.md)
