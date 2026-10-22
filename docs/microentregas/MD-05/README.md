# MD-05 — Contrato, plano e campanha

Estado: **Concluída**. Implementação autorizada pelo usuário em 22/10/2026 e aceita explicitamente com “md 5 aceito”, registrada na [TASK-0008](../../tasks/TASK-0008-md05-contrato-plano-campanha.md).

## Escopo entregue

- Campanha vinculada a ano letivo, com estado, período de inscrições, evidência de divulgação, calendário e condição de vagas.
- Versão de plano contratual com total anual e composição em centavos exatos: parcela inicial + parcelas restantes.
- Desconto de irmãos em pontos-base e desconto de pontualidade em campos distintos, sem aplicação automática.
- Proibição no contrato/plano de material coletivo obrigatório.
- Associação de turmas à campanha sem alterar ocupação, matrícula ou reserva de vaga.
- Edição com controle de versão e auditoria transacional, restrita à Direção.

Não inclui matrícula, aceite contratual, geração de obrigações, cobrança, pagamento, negociação, publicação externa, dados reais ou integração financeira.

## Como testar

1. Subir a pilha sem apagar volumes: `docker compose up -d --build --wait`.
2. Entrar com uma conta de Direção e abrir **Campanhas e planos**.
3. Cadastrar uma campanha com ano letivo fictício, datas, divulgação, calendário e condição de vagas.
4. Em **Planos e contratos**, cadastrar uma versão. Usar centavos: por exemplo, `1200000` de total, `120000` de inicial, `90000` em `12` parcelas restantes. O servidor deve aceitar somente se a soma fechar.
5. Conferir que desconto de irmãos e pontualidade aparecem separados e que material coletivo obrigatório não é aceito.
6. Em **Turmas ofertadas**, associar turma fictícia; a ocupação deve permanecer inalterada.
7. Tentar usar Secretaria/TI ou uma origem não autorizada: a API deve negar a operação.

## API

| Método | Rota | Uso |
| --- | --- | --- |
| GET | `/api/v1/commercial` | Consulta campanhas, planos, ofertas, anos e turmas |
| POST/PUT | `/api/v1/commercial/campaigns[:id]` | Criar/corrigir campanha |
| POST/PUT | `/api/v1/commercial/contracts[:id]` | Criar/corrigir versão do plano |
| POST | `/api/v1/commercial/offers` | Associar turma à campanha |

## Verificações registradas

- `pnpm build`: aprovado.
- `pnpm typecheck`: aprovado.
- `pnpm test`: 17 unitários aprovados, incluindo soma exata e proibição de material coletivo.
- `pnpm test:integration -- tests/integration/commercial.test.ts`: 27 testes aprovados na configuração, incluindo os cenários comerciais e suites existentes.
- `pnpm exec playwright test tests/e2e/commercial.spec.ts --workers=1`: 1 jornada aprovada; captura móvel e largura sem rolagem horizontal conferidas.
- `docker compose up -d --build --wait`: imagens e migração aplicadas no ambiente local sem remover volumes.

## Limitações

Os valores e evidências são fictícios. A versão cadastrada ainda não é aceite por uma pessoa contratante, não cria matrícula nem cobrança e não autoriza operação escolar real. Pendências legais, fiscais, contratuais e de publicação continuam fora desta microentrega.

## Estado

Entrega implementada, verificada e aceita pelo usuário. Não avançar para MD-06 automaticamente.
