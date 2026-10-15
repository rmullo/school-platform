# TASK-0004 — Skill e diretrizes de desenvolvimento

- Estado: Concluída.
- Criação: 13/10/2026.
- Microentrega: melhoria transversal do ambiente da MD-01.
- Origem: solicitação do usuário para adicionar skill e agent.md com boas práticas de UI, código e testes unitários.
- Escopo: skill local ao repositório, atualização do AGENTS.md existente e referências de uso/validação.
- Limites: não implementar novas telas, regras escolares ou MD-02; não alterar dependências e serviços por efeito da documentação.

## Critérios de aceite

- [x] Skill com instruções específicas da stack e referências para UI, código e testes.
- [x] AGENTS.md preserva decisões, limites das microentregas e aponta para a skill.
- [x] Orientações distinguem ferramentas disponíveis das que ainda precisam ser configuradas.
- [x] Estrutura da skill, links e comandos pertinentes verificados.
- [x] Trabalho, verificações e limitações registrados.
- [x] Aceite do usuário. Aprovação geral em 15/10/2026: “tudo ok no projeto. envie para o repositório remoto”.

## Trabalho e verificações

Registro aberto antes da edição. Consultados AGENTS.md, manifestos, configuração e exemplos de testes da MD-01 e a skill de criação de skills.

Criada .agents/skills/smartschool-development com SKILL.md, metadados de invocação e referências de UI, código e testes. Atualizados AGENTS.md, CONTRIBUTING, índice documental e CHANGELOG. Nenhuma dependência da aplicação foi alterada por esta tarefa.

| Verificação em 13/10/2026 | Resultado |
| --- | --- |
| quick_validate.py da skill-creator | Skill válida |
| Links locais e âncoras | 249 referências verificadas, sem erros |
| pnpm test | Quatro testes unitários aprovados |
| git diff --check | Sem erros |

O validador utilizou PyYAML em .tools/skill-validation, ignorado pelo Git, sem instalação global ou inclusão nas dependências do projeto. As instruções distinguem Vitest, Testcontainers e Playwright das ferramentas ainda não configuradas; a validação estrutural não equivale a uma avaliação comportamental independente da skill.

Em 15/10/2026, concluído o registro dos resultados já obtidos. Sem repetição de testes de aplicação para essa atualização documental.

## Feedback

| Data | Solicitação | Efeito |
| --- | --- | --- |
| 13/10/2026 | Adicionar skill e agent.md para UI, código e testes unitários | Criar orientação reutilizável no projeto e atualizar o AGENTS.md já existente |
| 15/10/2026 | “tudo ok no projeto. envie para o repositório remoto” | Diretrizes aprovadas; commit e envio ao remoto autorizados |

## Entrega

Aprovada pelo usuário em 15/10/2026. Consultar [AGENTS.md](../../AGENTS.md) e a [skill do projeto](../../.agents/skills/smartschool-development/SKILL.md). Commit e envio autorizados em 15/10/2026; consultar a versão e publicação no histórico Git.
