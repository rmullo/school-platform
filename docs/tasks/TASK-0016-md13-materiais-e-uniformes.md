# TASK-0016 — MD-13: livros, materiais e uniformes

- **Microentrega:** MD-13 — Livros, materiais e uniformes.
- **Estado:** Em validação.
- **Data de criação:** 22/10/2026.
- **Origem da solicitação:** usuário autorizou implementar o restante das MDs, sem aprovação intermediária.
- **Dependências:** MD-08 e MD-11; catálogo escolar, matrícula e permissões administrativas.
- **Requisitos relacionados:** RF-02, RF-07 e RF-13.

## Objetivo e limites

Modelar kits por ano/série, itens externos ou de cortesia, venda escolar com pagamento e entrega separados e uniforme opcional. Não condicionar matrícula, conclusão ou direitos escolares a compras; não inclui fornecedor, gateway ou operação real.

## Critérios de aceite

- [ ] Kit e itens têm ano, série, tipo e status claros.
- [ ] Compra externa/cortesia pode ser registrada sem cobrança escolar.
- [ ] Venda escolar separa pagamento, entrega e situação do item.
- [ ] Uniforme é opcional e nenhuma taxa coletiva obrigatória é criada.
- [ ] API, interface, auditoria e testes cobrem o fluxo principal e falhas.

## Verificações

| Data | Cenário ou comando | Resultado observado | Evidência/limitação |
| --- | --- | --- | --- |
| 22/10/2026 | `pnpm typecheck` | Passou | API, web, contratos, banco e storage |
| 22/10/2026 | `pnpm build` | Passou | Compilação completa |
| 22/10/2026 | `pnpm test` | 32 testes passaram | Pedido opcional e estados separados cobertos |
| 22/10/2026 | Integração `tests/integration/operations.test.ts` | 1 teste passou | Regressão de operações e RBAC; pedidos não foram exercitados nessa suíte |
| 22/10/2026 | Fluxo visual de kit/pedido/entrega | Não executado | Requer teste manual com cadastros fictícios |

## Alterações realizadas

Criados `MaterialKit`, `MaterialItem` e `MaterialOrder`, com origem, tipo, opcionalidade, status de pedido, pagamento e entrega separados. A tela Operações permite cadastrar kit, item opcional e pedido; nenhum deles altera matrícula ou conclusão.

## Roteiro de teste do usuário

- Criar kit fictício, registrar item comprado externamente e cortesia.
- Criar pedido escolar, marcar pagamento e entrega em momentos diferentes.
- Confirmar que a matrícula e a conclusão permanecem disponíveis sem compra.

## Aceite e referências

- Aceite do usuário: pendente; entrega ficará em validação.
- Publicação e dados reais: não realizados.

