# MD-03 — Estrutura escolar

Estado: **Em validação**. Planejamento autorizado em 21/10/2026 após o aceite da MD-02; implementação solicitada e verificada em 22/10/2026. Execução na [TASK-0006](../../tasks/TASK-0006-md03-estrutura-escolar.md), com aceite pendente. MD-04 não iniciada.

## Escopo

Ano letivo, etapa, série, turma, capacidade máxima e referência administrativa à autorização da etapa. O cadastro e a consulta devem preservar relacionamentos, validar capacidade e separar estrutura registrada de oferta ativada.

## Regras desta etapa

- A etapa registra órgão, ato, validade e evidência da autorização como referência administrativa.
- Atos e órgãos dos testes são fictícios e não representam autorização real.
- Não ativar oferta sem referência de autorização válida para o cenário demonstrado.
- Não reduzir capacidade abaixo da ocupação existente.
- Não inventar critérios etários, exceções ou limites normativos ausentes dos documentos vigentes.
- Diretor administra a estrutura; Secretaria e TI não recebem operações além da matriz autorizada.
- Alunos, responsáveis, matrículas, campanhas, contratos e dados reais ficam fora da MD-03.

## Demonstração prevista

1. Criar ano letivo, etapa, série e turma com dados fictícios.
2. Associar uma referência de autorização fictícia e ativar a oferta.
3. Consultar a estrutura e a capacidade.
4. Tentar salvar campos inválidos e reduzir a capacidade abaixo da ocupação.
5. Confirmar bloqueios de perfil na API e a auditoria das alterações.

## Dependências e limitações

MD-02 está aprovada. A capacidade ocupada será preparada com uma fixture técnica ou somente com registros da própria tarefa; não criar matrícula escolar antecipadamente. A validade jurídica dos atos, critérios etários, escrituração e autorização real permanecem pendentes de evidência operacional.

[Voltar ao roadmap](../../roadmap.md).

## Como executar e testar

Atualizar a pilha sem apagar volumes:

```sh
docker compose up -d --build --wait
```

Entrar em http://localhost:5173 com o Diretor local e abrir **Estrutura escolar**. No desenvolvimento pelo host, executar build e `pnpm db:migrate` antes de iniciar API/web. A migração é adicional: não altera as migrações aplicadas da MD-01/MD-02 ou remove contas existentes.

1. Em **Anos letivos**, cadastrar um ano livre, por exemplo 2027, com início `2027-02-01` e fim `2027-12-10`. Essas datas são exemplos, não calendário escolar aprovado.
2. Em **Etapas**, cadastrar “Infantil fictício”, selecionar Infantil e **Informar referência**. Usar “Órgão Fictício”, “Ato Fictício 01” e “Evidência fictícia — sem validade operacional”, com validade de `2026-01-01` a `2028-12-31`. Manter **Fictícia — demonstração**.
3. Em **Séries**, cadastrar uma série fictícia vinculada à etapa.
4. Em **Turmas**, cadastrar “Turma A fictícia”, selecionar ano/série e capacidade 12. Esperado: zero vagas ocupadas e oferta em rascunho.
5. Clicar **Ativar oferta**, informar motivo e confirmar. Esperado: oferta disponível para demonstração. Sem autorização, com validade insuficiente ou vencida, a API rejeita a ativação e não deixa alteração/auditoria parcial.
6. Editar capacidade para 15 com motivo. Tentar zero ou número fracionário: não salvar. Ocupação não é campo de cadastro/edição. O cenário abaixo da ocupação é verificado no banco isolado pelo teste de integração, com fixture técnica, sem criar matrículas no ambiente.
7. Tentar encurtar a autorização de uma etapa com oferta ativa, deixando o período sem cobertura: rejeitar e preservar dados anteriores. Primeiro desativar ofertas afetadas se a referência precisar mudar.
8. Repetir acesso com Secretaria/TI: menu não aparece, rota web redireciona e API retorna 403. Sem sessão, API retorna 401.
9. Em **Contas e auditoria**, conferir autoria, ação e motivo. A API também registra o estado anterior/posterior da estrutura; não existe edição/exclusão desses eventos pela interface.
10. Em cada aba, usar **Excluir**, informar o motivo e confirmar. O sistema deve concluir apenas quando não houver dependências; em turma ativa, desative a oferta antes.

Nenhuma etapa, série ou turma é semeada automaticamente no banco de desenvolvimento. E2E cria estrutura temporária com identificadores próprios e remove apenas suas fixtures. A conta de Diretor de teste existente é preservada.

## Dados e contratos

| Cadastro | Campos e regras |
| --- | --- |
| Ano letivo | Número único (1900–2200, limite técnico de entrada), início/fim em data civil ISO, fim não anterior ao início |
| Etapa | Nome único sem diferenciar caixa/espaços externos, segmento Infantil/Fundamental, referência administrativa opcional enquanto rascunho |
| Referência | Órgão, ato, evidência textual/localizador, início/fim da validade e marca de demonstração. Não há upload ou certificação jurídica nesta etapa |
| Série | Nome único dentro da etapa; vínculo existente obrigatório |
| Turma | Nome único dentro de ano/série; capacidade inteira positiva, ocupação técnica não negativa e menor/igual à capacidade; começa inativa |
| Edição | UUID, versão esperada e motivo de 5–300 caracteres; conflito exige atualizar/reabrir edição, sem sobrescrever silenciosamente |

Datas civis são mantidas como `YYYY-MM-DD`, sem conversão de fuso. Para avaliar vencimento atual, usa-se a data em `America/Fortaleza`. A referência deve abranger todo o período letivo e não estar vencida; referência que inicia no futuro pode cobrir período futuro. Ao vencer, uma oferta marcada ativa deixa de ser retornada como disponível, sem depender de worker ou agendamento.

Não é permitido trocar segmento de etapa com séries ou etapa de série com turmas; turma ocupada não troca de ano/série. A exclusão exige motivo, versão esperada e confirmação na interface: registros-pai com dependentes, turmas ocupadas e ofertas ativas são protegidos. A implementação futura de matrículas deverá atualizar ocupação na mesma transação e respeitar as restrições, conforme MD-07.

## API

Todas as rotas exigem Bearer de Diretor. Escritas usam o cabeçalho `x-smartschool-client: web` e a verificação de origem já adotada na MD-02.

| Método | Rota | Uso |
| --- | --- | --- |
| GET | `/api/v1/school` | Estrutura completa em snapshot consistente; resposta sem cache |
| POST | `/api/v1/school/:resource` | Cadastrar `years`, `stages`, `grades` ou `classrooms` |
| PUT | `/api/v1/school/:resource/:id` | Substituir campos editáveis com `{version,reason,data}` |
| DELETE | `/api/v1/school/:resource/:id` | Excluir cadastro sem dependências com `{version,reason}` |
| PATCH | `/api/v1/school/classrooms/:id/offer` | Ativar/desativar com `{version,reason,active}` |

Listagem integral nesta etapa, sem paginação. Contratos Zod são compartilhados entre API e UI. Cadastro/edição/exclusão, controle de versão e auditoria são transacionais; capacidade/ocupação, vínculos e unicidade também têm proteção PostgreSQL. Atos/capacidade reais, critérios etários, campanhas, matrículas e prontidão operacional continuam fora desta entrega.
