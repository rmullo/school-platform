---
name: smartschool-development
description: Implementar e revisar microentregas do SmartSchool com React/MUI, NestJS/Prisma e testes Vitest/Playwright. Usar em mudanças de UI, comportamento, refatorações ou testes neste repositório; não para tarefas sem relação com o projeto.
---

# Desenvolvimento do SmartSchool

Aplicar à microentrega solicitada, preservando as regras aprovadas. Executar comandos a partir da raiz do repositório, onde estão package.json e AGENTS.md. A skill orienta o trabalho; não amplia a autorização para implementar outras etapas, publicar alterações ou usar dados reais.

## Contexto necessário

Consultar [AGENTS.md](../../../AGENTS.md), a tarefa ativa em [docs/tasks](../../../docs/tasks/README.md) e os critérios da microentrega no [roadmap](../../../docs/roadmap.md). Para uma regra escolar, consultar a [especificação](../../../docs/SPECIFICATION.md) e a decisão correspondente; não reconstruir a regra a partir do código ou do histórico substituído.

Antes de editar, observar o padrão do módulo afetado, os contratos consumidos e os testes existentes. Registrar o escopo na tarefa. Reutilizar componentes, tema e pacotes em uso; criar abstração ou dependência apenas quando resolver uma necessidade concreta da entrega.

## Guias por tipo de mudança

Ler apenas as referências pertinentes:

- Tela, formulário, navegação, feedback e acessibilidade: [UI](references/ui.md).
- API, contratos, persistência, integrações e refatoração: [Código](references/code.md).
- Comportamento novo, regressão, regras ou isolamento de dependências: [Testes](references/testing.md).

Mudanças que atravessam interface, API e banco precisam dos guias correspondentes; não classificar uma operação financeira como “só UI” porque o pedido menciona um botão.

## Ciclo de execução

1. Traduzir o pedido em comportamento observável e critérios pequenos de aceite. Separar decisões confirmadas de pendências. Avançar no trabalho independente quando faltar uma definição.
2. Escolher o nível de teste pelo risco e pela fronteira alterada. Para correção de defeito, reproduzir a falha antes da correção quando viável.
3. Implementar o fluxo mínimo completo da tarefa, incluindo mensagens de erro e recuperação pertinentes. Manter a consistência no servidor mesmo quando a UI impede cliques repetidos.
4. Executar verificações proporcionais, registrar resultados reais e examinar o diff. Em UI, conferir também o resultado visual e o uso por teclado.
5. Atualizar tarefa, documentação afetada e CHANGELOG. Entregar passos para teste do usuário, limitações e estado **Em validação**. Somente aceite explícito encerra a entrega.

## Comandos disponíveis

Confirmar os scripts no package.json antes de executá-los; esta lista descreve a fundação da MD-01.

| Verificação | Comando na raiz | Condição |
| --- | --- | --- |
| Tipos | `pnpm typecheck` | Dependências instaladas e cliente Prisma gerado pelo build |
| Compilação | `pnpm build` | Gera os pacotes compartilhados e aplicações |
| Unitários | `pnpm test` | Após build dos pacotes importados pelos testes |
| Integração | `pnpm test:integration` | Docker disponível; banco isolado com Testcontainers |
| Interface | `pnpm test:e2e` | Pilha local pronta e Chromium instalado |
| Serviços | `pnpm smoke` | .env local e pilha completa pronta |

Uma alteração somente documental exige conferir links e coerência, sem subir a aplicação. Uma alteração apenas visual de baixo impacto não exige criar testes unitários artificiais. Não executar testes de indisponibilidade contra ambientes compartilhados ou produção.

## Critério de entrega

Relatar o comportamento obtido, o que foi verificado e o que permanece pendente. Não apresentar mocks como prova de transações reais, testes locais como execução de CI ou uma skill como configuração de ferramentas ausentes. Não mudar critérios para fazer um teste passar sem reavaliar o requisito.
