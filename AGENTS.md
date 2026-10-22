# SmartSchool

## Escopo e fonte de verdade

- Desde 06/10/2026, o usuário determinou documentação primeiro, uma etapa por vez, sob sua orientação. Não retomar implementação ou avançar para outra etapa por iniciativa própria.
- Em 07/10/2026, o usuário solicitou excluir toda a implementação anterior e manter somente a documentação para o GitHub. Não recriar código, dependências, infraestrutura ou automações de build sem nova solicitação.
- Começar pelo índice docs/README.md. Consultar a situação de cada documento; alguns já têm adequações legais autorizadas. Não confundir requisitos documentados com controles implementados.
- docs/SPECIFICATION.md contém o planejamento vigente, incluindo a adequação legal autorizada em 07/10/2026 e registrada em docs/decisions/0001-adequacao-legal.md. Histórico e conversa recuperada não sobrepõem regras substituídas; preservar sua rastreabilidade.
- A decisão docs/decisions/0002-mvp-sem-kafka.md retira Kafka, Kafka UI, os três workers, Outbox, consumidores e retry/DLQ de mensagens do MVP. Usar planejamento transacional no PostgreSQL; não recriar mensageria por referência ao histórico.
- Preservar decisões aprovadas e registrar divergências; não inventar valores dos anexos indisponíveis.
- Em alterações apenas documentais, conferir links e coerência; não é necessário subir aplicações ou executar a suíte de código.
- Desde 08/10/2026, seguir docs/roadmap.md para microentregas e docs/tasks/README.md para registro de tarefas. Antes de executar uma tarefa, registrar escopo e aceite; ao entregar, documentar alterações, verificações reais, limitações e roteiro de teste do usuário. Atualizar CHANGELOG.md e documentos afetados. Não inventar testes, commits, publicações ou aceites.
- Registrar ajustes e retorno do usuário; estado Em validação não equivale a Concluída. Não avançar automaticamente para a próxima microentrega antes do aceite/orientação do usuário. O roadmap é planejamento, não autorização para implementar o projeto inteiro.
- Os guias em docs/historico descrevem uma implementação removida. Seus comandos não estão disponíveis neste repositório documental.
- Não versionar .env, dados pessoais ou dumps. Não remover volumes para resolver problemas sem autorização.
- Nunca modificar referências sincronizadas em sources/ do projeto que contém este repositório, quando essa pasta estiver presente.

- Em 13/10/2026, após aprovar a MD-00, o usuário solicitou a MD-01. Está autorizada a implementação da fundação descrita no roadmap e em docs/tasks/TASK-0003-md01-fundacao.md. A restrição documental anterior permanece como histórico; não impede esta etapa explicitamente solicitada. Não avançar para MD-02 ou regras escolares sem nova orientação.
- Em 21/10/2026, o usuário solicitou executar a MD-02. Autorizados acesso, sessões, contas individuais, RBAC e auditoria básica conforme docs/tasks/TASK-0005-md02-acesso-e-auditoria.md. A autorização não abrange MD-03, publicação ou uso de dados reais.

## Skill de desenvolvimento do projeto

Em 22/10/2026, o usuário solicitou executar a MD-03, cujo planejamento está na TASK-0006. Autorizados estrutura escolar, referência administrativa de autorização, capacidade, oferta, auditoria e testes correspondentes. Em 22/10/2026, o usuário registrou “md 03 está ok. documente a finalização”, encerrando a MD-03 com aceite explícito. Não avançar para MD-04, publicar ou usar dados reais sem nova orientação.

Para implementar ou revisar UI, código e testes do SmartSchool, ler [.agents/skills/smartschool-development/SKILL.md](.agents/skills/smartschool-development/SKILL.md). Carregar somente os guias relevantes à tarefa: UI, código e/ou testes. A skill pertence a este repositório; não requer copiar configuração para outros projetos.

Este AGENTS.md é o ponto de entrada das instruções para agentes. Não criar um agent.md paralelo com regras duplicadas. Instruções e autorização explícitas do usuário prevalecem; a skill não autoriza avançar de microentrega, publicar ou usar dados reais.

## Padrões de implementação e UI

- Preservar a stack e as fronteiras já estabelecidas: apps/api, apps/web e packages/contracts, database e storage. Conferir manifestos antes de usar bibliotecas; preferir reaproveitamento a novas dependências.
- Manter TypeScript estrito, validar entradas nas fronteiras e evitar duplicação de regras entre interface e API. Regras financeiras/transacionais serão implementadas somente nas etapas correspondentes.
- Reutilizar MUI e o tema da aplicação; organizar componentes por responsabilidade conforme as funcionalidades cresçam. Não tratar o arquivo único da MD-01 como modelo para o sistema inteiro.
- Projetar os estados aplicáveis de carregamento, vazio, erro, sucesso e envio, com recuperação compreensível. Conferir teclado, foco, nomes acessíveis, largura móvel e conteúdo longo nas mudanças de UI.
- Não apresentar dados antigos como sucesso atual após falha de atualização. Desabilitar um botão durante envio ajuda a interação, mas não substitui as garantias do servidor.

## Testes e qualidade

- Mudanças de comportamento devem receber testes proporcionais ao risco. Priorizar validações, falhas, limites e regressões; não criar testes que apenas espelhem o código ou CSS.
- Unitários ficam em tests/unit/**/*.test.ts, executados com pnpm test. Eles devem ser determinísticos, independentes e sem banco/rede. Não presumir ferramentas de testes de componente ou cobertura já instaladas.
- Usar Testcontainers/PostgreSQL para restrições, migrações e transações; Playwright para jornadas e estados da interface. Seletores acessíveis são preferidos a detalhes internos do MUI.
- Executar build/typecheck e suites afetadas conforme a alteração; conferir os comandos e pré-requisitos na skill. Não inventar comandos de lint ou resultados de CI.
- Antes de entregar, revisar o diff e atualizar tarefa, documentação e CHANGELOG com resultados reais. Relatar o que mudou, como testar e limitações. Manter Em validação até o aceite do usuário.
