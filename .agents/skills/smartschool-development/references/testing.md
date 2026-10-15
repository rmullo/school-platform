# Testes proporcionais ao comportamento

Ler ao implementar comportamento, corrigir defeito ou escrever testes. A configuração atual é [vitest.config.ts](../../../../vitest.config.ts), com testes unitários em tests/unit/**/*.test.ts. Consultar o [exemplo existente](../../../../tests/unit/config.test.ts) para integração com o runner, sem reproduzir suas escolhas mecanicamente.

## Escolher o nível certo

| Comportamento | Verificação adequada |
| --- | --- |
| Validação, transformação, policy ou cálculo puro | Unitário Vitest, sem banco/rede |
| Contrato entre API e frontend | Schema e exemplos válidos/inválidos; jornada quando pertinente |
| Migração, persistência, rollback, restrição ou concorrência | Integração com PostgreSQL real isolado |
| Clique, formulário, navegação, mensagem e recuperação | Playwright ou teste de componente quando configurado |
| Mudança visual simples | Inspeção visual/teclado; sem teste que copie CSS ou implementação |
| Configuração de infraestrutura | Validação de configuração, smoke e persistência conforme impacto |

Mocks de Prisma não provam rollback, isolamento ou disputa de vaga. Não chamar testes com banco de “unitários”. Evitar duplicar o mesmo detalhe em todos os níveis; concentrar cada teste na fronteira que pode falhar.

## Unitários úteis

- Nomear o teste pelo comportamento e resultado, com preparação, ação e verificação claras.
- Cobrir caminho normal, limites e falhas pertinentes ao risco. Na futura lógica financeira, usar resultados esperados independentes da implementação, incluindo arredondamento e condições aprovadas.
- Ao corrigir uma regressão, adicionar caso que falhe pelo defeito observado, quando viável. Não escrever apenas um teste que verifica se a mesma função mockada foi chamada.
- Controlar relógio, aleatoriedade e dependências externas quando influírem no resultado. Restaurar mocks e temporizadores depois de cada teste.
- Evitar rede, Docker, credenciais reais, sleeps e estado compartilhado nos unitários. Isolar fixtures; cada teste deve poder rodar sozinho e em outra ordem.
- Testar a interface pública do comportamento; não acessar campos privados ou impor sequência interna irrelevante.
- Uma asserção de erro deve falhar se nenhuma exceção for lançada: preferir expect(...).toThrow ou rejects. Evitar try/catch que passe sem executar asserção.
- Usar parametrização quando os casos diferem apenas em entradas e saídas. Evitar snapshots extensos ou metas arbitrárias de 100% de cobertura; cobertura, quando configurada, serve para localizar riscos não exercitados.

## Frontend e ferramentas disponíveis

Vitest está configurado para unitários em Node. Playwright já testa a interface no navegador. React Testing Library, ambiente DOM para unitários, relatório de cobertura, lint e formatação automática não estão configurados nesta fundação.

Quando uma tarefa precisar de testes de componente, adicionar e configurar o suporte pertinente explicitamente, com instalação e execução verificadas. Não escrever imports de ferramentas ausentes nem declarar que uma configuração documental as instalou.

## Execução e evidências

Após instalar dependências e compilar os pacotes compartilhados:

- Suite unitária: `pnpm test`.
- Arquivo unitário específico: `pnpm exec vitest run tests/unit/config.test.ts`.
- Integração: `pnpm test:integration`, com Docker.
- E2E: `pnpm test:e2e`, com pilha local saudável e Chromium instalado.

Executar primeiro o teste afetado e depois ampliar conforme o risco e as dependências alteradas. Não repetir suites já aprovadas sem mudança ou preocupação concreta. Se um teste falhar, distinguir defeito de produto, teste incorreto e problema de ambiente; não enfraquecer a asserção ou habilitar retries para esconder o problema.

Registrar comando, resultado, casos relevantes e verificações não realizadas. CI configurada não significa CI executada. Não marcar a entrega concluída só porque os testes passaram: a microentrega aguarda validação do usuário.
