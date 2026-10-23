# TASK-0019 — massa fictícia de 200 matrículas em 2026

- **Microentrega:** Dados de teste transversais para validação local.
- **Estado:** Em validação.
- **Data de criação:** 22/10/2026.
- **Origem da solicitação:** usuário solicitou criar diretamente no banco da aplicação 200 alunos matriculados em 2026, com diversidade e peculiaridades fictícias.
- **Dependências:** migrações locais aplicadas e banco de desenvolvimento acessível.

## Objetivo e limites

Criar 200 alunos fictícios com matrículas confirmadas em 2026, distribuídos entre Infantil e Fundamental, turmas e situações familiares/financeiras/documentais variadas. A carga deve ser idempotente, identificável por uma chave de fixture e limitada ao banco local de desenvolvimento. Não criar pessoas reais, não publicar dados e não alterar `sources/`.

## Critérios de aceite

- [ ] Existem exatamente 200 matrículas confirmadas da fixture em 2026.
- [ ] O banco contém diversidade de etapas, séries, turmas, responsáveis, irmãos, acordos, recebimentos, créditos e pendências documentais fictícias.
- [ ] A execução repetida não duplica a massa.
- [ ] A consulta gerencial e a tela de matrículas conseguem consumir a massa sem erro.
- [ ] A tarefa registra contagens reais, limitações e como remover a fixture caso necessário.

## Verificações

| Data | Cenário ou comando | Resultado observado | Evidência/limitação |
| --- | --- | --- | --- |
| 22/10/2026 | `node --env-file=.env scripts/seed-200-students-2026.mjs` | Fixture criada no PostgreSQL local | 200 alunos, 200 matrículas, 8 turmas, 2.225 obrigações, 50 recebimentos, 25 créditos, 18 negociações |
| 22/10/2026 | Consulta direta de reconciliação por campanha | Passou | 200 matrículas `CONFIRMED`; turmas com `capacity=25` e `occupied=25`; 137 conclusões completas e 63 pendentes |
| 22/10/2026 | Reexecução da fixture | Idempotência protegida | A campanha marcada impede duplicação; execução completa posterior não foi necessária |

## Roteiro de teste do usuário

- Entrar com a conta fictícia de Diretor ou Secretaria.
- Abrir matrículas, operações e consulta gerencial.
- Filtrar/percorrer etapas, turmas e situações; confirmar que os dados são claramente fictícios.

## Resultado da carga

A fixture `SMARTSCHOOL-FIXTURE-200-2026` foi criada com Infantil e Fundamental, oito séries/turmas, grupos de irmãos, responsáveis não parentais, representações com restrições, pagadores fictícios, entradas tardias em agosto/setembro, dispensa/negociação da entrada, pendências documentais, recebimentos manuais, créditos e negociações de mensalidades. Os kits de material também foram criados para as oito séries.

## Aceite e referências

- Aceite do usuário: pendente.
- Dados reais: não permitidos; a fixture usa nomes, e-mails e referências `example.test`.
- Remoção: não executada. A fixture deve ser removida somente com comando/escopo explícito, após confirmar os relacionamentos dependentes.
