# TASK-0002 — MD-00: regras, exemplos e fluxo de matrícula

## Identificação

- Microentrega: MD-00.
- Estado: Concluída.
- Aceite documental: 13/10/2026.
- Criação: 08/10/2026.
- Origem: usuário solicitou “faça o MD-00”.
- Execução: assistente; validação pelo usuário.
- Requisitos: RF-01 a RF-08, RF-11 e RF-13; decisões 0001, 0002 e 0003.
- Dependências: documentação vigente; contrato, lista de materiais e demais anexos originais continuam indisponíveis.

## Objetivo e limites

Documentar o fluxo da matrícula, estados independentes, composição financeira, cancelamento, vínculos e documentos, com cenários fictícios e esboços de telas revisáveis. Não implementar aplicação nem iniciar MD-01. Não aprovar contratos ou dados ausentes por suposição.

## Critérios de aceite

- [x] Fluxo e estados documentados com condições de transição.
- [x] Exemplos de matrícula normal, irmãos, ingresso tardio e desistência com resultados esperados e cálculos conferidos.
- [x] Representação legal e critérios de documentos separados de obrigações financeiras/comerciais.
- [x] Esboços e roteiro de revisão manual disponíveis.
- [x] Decisões confirmadas separadas de propostas e pendências externas; documentos relacionados alinhados.
- [x] Verificações e retorno do usuário registrados.
- [x] Aceite explícito da entrega pelo usuário: “tudo ok no md-00”, em 13/10/2026.

## Trabalho realizado

Registro aberto antes da elaboração dos artefatos. Entrega disponível em docs/microentregas/MD-00/: README com fluxo, estados e pendências; financeiro com cinco planos exemplificados e movimentações; cenarios com 19 casos de revisão; telas com cinco esboços textuais.

Registrada a decisão 0003 com a confirmação de ingresso tardio; alinhados especificação, PRD, mapa normativo, matriz de conformidade, índices, roadmap e CHANGELOG. Aritmética usa valores de referência, sem alterar tabela ou contrato real. Não houve implementação ou início da MD-01.

## Verificações

| Data | Verificação | Resultado |
| --- | --- | --- |
| 08/10/2026 | Links locais e âncoras nos documentos | 216 referências em 39 arquivos Markdown, sem erros |
| 08/10/2026 | Cálculos em centavos inteiros | 18 verificações aprovadas: planos F-01 a F-05, irmãos, saldos, reversão, crédito e restituição |
| 08/10/2026 | Identificadores de cenários e microentregas | 19 cenários e 16 microentregas, sem duplicidades |
| 08/10/2026 | Coerência documental | Fórmula confirmada propagada; estados/telas propostos e pendências P-01 a P-07 explícitos |
| 08/10/2026 | Formatação das alterações pelo Git | Sem erros |
| 13/10/2026 | Registro do aceite, coerência dos estados, links e formatação | Aceite refletido no guia, índices e roadmap; links locais/âncoras e diff conferidos sem erros; P-01 a P-07 preservadas |

Não foram executados testes de aplicação. A conferência aritmética valida exemplos, não uma implementação de cálculo ou contrato. Os anexos originais não foram inspecionados.

## Roteiro de revisão do usuário

1. Abrir docs/microentregas/MD-00/README.md e conferir o fluxo de atendimento.
2. Conferir financeiro.md, especialmente os planos de ano completo, irmãos e agosto.
3. Percorrer C-01 a C-19 em cenarios.md e indicar ajustes pelo identificador.
4. Conferir as cinco telas textuais e a lista de documentos proposta.
5. Revisar P-01 a P-07: aceitar a entrega documental não resolve automaticamente essas pendências. Registrar aqui o retorno antes de avançar para outra etapa.

## Feedback e ajustes

| Data | Retorno | Efeito |
| --- | --- | --- |
| 08/10/2026 | Ingresso tardio: “proporcional com a quantidade de meses até o final do ano + matrícula inicial” | Substitui a proposta de abater a parcela inicial das mensalidades restantes. O total do período inclui inicial mais meses restantes, sem taxa externa ao total anunciado |
| 08/10/2026 | “faça um comit e mande para o github” | Autoriza versionar e enviar a documentação atual para origin/main; não altera o aceite funcional da MD-00 |
| 13/10/2026 | “tudo ok no md-00” | Aceite da entrega documental; concluir TASK-0002 e alinhar índices/roadmap, preservando P-01 a P-07 e sem iniciar MD-01 |

## Registro de alterações

| Data | Alteração | Motivo |
| --- | --- | --- |
| 08/10/2026 | Abertura da tarefa MD-00 | Execução solicitada pelo usuário |
| 08/10/2026 | Fluxos, exemplos, 19 cenários e cinco esboços preparados | Tornar regras e pontos pendentes revisáveis antes do código |
| 08/10/2026 | Fórmula de ingresso tardio e decisão 0003 | Incorporar resposta do usuário e substituir a hipótese de abatimento da inicial |
| 08/10/2026 | Verificações registradas; entrega em validação | Permitir revisão sem presumir aceite ou iniciar MD-01 |
| 13/10/2026 | Aceite registrado; estado e índices atualizados | Encerrar a entrega documental conforme aprovação explícita do usuário |

## Aceite e referências

- Aceite da microentrega: confirmado em 13/10/2026 pela mensagem “tudo ok no md-00”. Abrange os artefatos documentais; não resolve as questões abertas P-01 a P-07 nem certifica a operação escolar.
- Versionamento: commit e envio a origin/main solicitados em 08/10/2026. Escopo: documentação do roadmap, MD-00 e respectivos registros; verificar formatação, conteúdo preparado e igualdade entre HEAD e remoto após o envio. A evidência de versão/publicação é o histórico Git, sem antecipar resultado neste registro.
- Pendências: documentos externos e decisões identificadas no material da entrega.
