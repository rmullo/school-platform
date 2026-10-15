# Código e fronteiras

Ler quando mudar API, contratos, dados, integrações ou estrutura do código.

## Organização atual

| Local | Responsabilidade |
| --- | --- |
| apps/api | API NestJS, configuração, transporte HTTP e coordenação dos casos de uso |
| apps/web | Interface React/Vite e interação com o usuário |
| packages/contracts | Contratos JSON/Zod consumidos entre aplicações |
| packages/database | Cliente Prisma, schema e migrações |
| packages/storage | Adaptação ao armazenamento S3/MinIO |
| tests | Testes unitários, integração e jornadas da interface |

Criar módulos escolares apenas na etapa autorizada. Não acrescentar Kafka, filas, workers, eventos genéricos ou camadas vazias. Aplicar os padrões aprovados quando resolverem um problema real; não criar interfaces/repositórios para cada classe por rotina.

## Implementação

- TypeScript estrito nas aplicações e pacotes. Tipar fronteiras; receber entradas externas como desconhecidas e validá-las. Evitar any e asserções que apenas escondam incompatibilidades.
- Manter controllers focados em entrada/saída. Quando houver regras, isolá-las em funções/policies testáveis e coordená-las nos serviços. Injetar dependências externas conforme o módulo exigir.
- Reutilizar contratos compartilhados; não importar detalhes internos de outro pacote ou modelos Prisma no frontend. Alterar contrato junto dos produtores, consumidores e testes afetados.
- Separar erro de configuração, entrada inválida, conflito de negócio e indisponibilidade. Retornar erro compreensível e correlationId sem credenciais, SQL, stack ou dados pessoais.
- Tornar explícitos limites de tempo e encerramento de conexões. Falhas de dependências devem afetar prontidão; não confundir prontidão com o processo estar vivo.

## Dados e segurança

- Financeiro futuro usa Decimal/NUMERIC ou representação exata conforme contrato definido; nunca ponto flutuante para valores monetários. Especificar arredondamento antes de calcular.
- Instantes operacionais em UTC; datas civis e vencimentos não devem mudar de dia por conversão de fuso. Testar casos de fronteira quando esse comportamento for implementado.
- Usar transações, restrições e chaves de operação para as invariantes aprovadas. Não confiar em uma consulta seguida de escrita desprotegida quando houver disputa de vaga ou saldo.
- Uma transação SQL não inclui S3 ou pagamentos externos. Modelar recuperação de falhas desses fluxos na entrega correspondente, sem presumir atomicidade.
- Migrações precisam de revisão do impacto sobre dados existentes. Não alterar migração já aplicada para mascarar mudança de schema nem apagar volumes para contornar erro.
- Autorizações devem ser verificadas no servidor quando implementadas; esconder um botão não protege uma operação. MD-02 ainda é a etapa de autenticação/RBAC.
- Manter segredos em configuração local/ambiente, fora de Git, logs e bundle web. Usar dados fictícios em testes e evidências.

## Dependências e revisão

Preservar pnpm/Node e lockfile definidos no projeto. Antes de adicionar uma biblioteca, conferir necessidade, compatibilidade e o que já existe. Verificar APIs/versões em documentação oficial quando houver dúvida; não atualizar versões principais incidentalmente.

Ao revisar o diff, procurar duplicação de regras, efeitos colaterais fora do escopo, vazamento de dados, erros sem recuperação e mudanças de contrato sem consumidor correspondente. Registrar decisões estruturais relevantes em docs/decisions; correções rotineiras ficam na tarefa.
