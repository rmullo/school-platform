# TASK-0017 — MD-14: consulta gerencial

- **Microentrega:** MD-14 — Consulta gerencial.
- **Estado:** Em validação.
- **Data de criação:** 22/10/2026.
- **Origem da solicitação:** usuário autorizou implementar o restante das MDs, sem aprovação intermediária.
- **Dependências:** fluxos financeiros das MD-05 a MD-10; acesso restrito e auditoria.
- **Requisitos relacionados:** relatórios financeiros, RF-03, RF-09 e proteção de dados.

## Objetivo e limites

Disponibilizar dashboard gerencial e consultas por período/contrato para recebimentos, saldos, vencimentos, pendências, créditos e restituições, reconciliados com PostgreSQL. Não expor dívida publicamente nem criar exportação de dados reais.

## Critérios de aceite

- [ ] Totais consultam registros transacionais e diferenciam recebido, aberto, crédito, restituição e cancelado.
- [ ] Filtros por período e contrato são aplicados no servidor.
- [ ] Acesso é restrito a perfis autorizados e auditável.
- [ ] Ausência, erro e filtros inválidos têm estados compreensíveis.
- [ ] Testes verificam reconciliação e isolamento de acesso.

## Verificações

| Data | Cenário ou comando | Resultado observado | Evidência/limitação |
| --- | --- | --- | --- |
| 22/10/2026 | `pnpm typecheck` | Passou | API, web, contratos, banco e storage |
| 22/10/2026 | `pnpm build` | Passou | Compilação completa |
| 22/10/2026 | `pnpm test` | 32 testes passaram | Filtros e contratos gerenciais cobertos |
| 22/10/2026 | Integração `tests/integration/operations.test.ts` | 1 teste passou | Relatório vazio, acesso da Direção e bloqueio da Secretaria |
| 22/10/2026 | Reconciliação contra pagamentos/reversões/restituições reais do banco | Não executado | Requer massa fictícia financeira e teste manual de filtros |

## Alterações realizadas

Criados contrato e endpoint de relatório gerencial com filtro por período/contrato, agregações de recebimentos, obrigações, créditos e restituições, controle de acesso e auditoria. A tela apresenta os totais e mantém o conteúdo sem exposição pública.

## Roteiro de teste do usuário

- Conferir totais contra matrícula, recebimento, crédito, negociação e restituição fictícios.
- Filtrar um contrato e um intervalo; tentar acessar com perfil sem permissão.

## Aceite e referências

- Aceite do usuário: pendente; entrega ficará em validação.
- Publicação e dados reais: não realizados.
