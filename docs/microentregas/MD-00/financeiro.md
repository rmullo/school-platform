# MD-00 — Composição financeira e cancelamento

> Exemplos de cálculo, com pessoas fictícias e valores do Infantil já registrados na conversa. Não são propostas contratuais emitidas. Referência: [especificação](../../SPECIFICATION.md). Dúvidas abertas: [P-01 a P-07](README.md#pendências-delimitadas).

## Regra comercial confirmada

Em 08/10/2026 o usuário confirmou: ingresso durante o ano é proporcional à quantidade de meses restantes **mais a parcela inicial**. Não abater automaticamente a parcela inicial da mensalidade de ingresso.

Para a tabela infantil de referência, sem negociação adicional:

- Parcela inicial: R$ 275,00, uma única vez por matrícula, sem desconto de irmãos.
- Mensalidade nominal: R$ 315,00.
- Pontualidade: R$ 15,00 por mensalidade integral paga até dia 10, nas condições já aprovadas.
- Benefício de irmãos confirmado pela Secretaria: R$ 30,00 por mensalidade (10% sobre R$ 300,00), mantido após o vencimento.
- Multa e juros dos exemplos: zero.

Se `n` é o número de competências mensais do período: total nominal de referência = `275 + n × 315`. Total com benefício de irmãos = `275 + n × 285`. Total se todas as mensalidades forem pontuais = `275 + n × 300`, ou `275 + n × 270` com irmãos. O total efetivamente pago depende das condições de cada parcela e de negociações formalizadas.

Para ingresso em agosto, `n = 5` (agosto a dezembro); para ano completo no plano usual, `n = 11` (fevereiro a dezembro). Não extrapolar essa tabela para Fundamental ou futuro Médio.

## Transparência do total

O total anunciado/contratado para o período já inclui a parcela inicial e todas as competências. A inicial não é acrescida novamente ao total. A obrigação inicial e a primeira mensalidade são itens distintos do mesmo plano, sem gerar a mesma cobrança duas vezes.

A composição comercial aprovada não dispensa revisar o contrato, a anuidade de referência e a informação ao contratante. Renomear taxa não torna válida uma cobrança externa ao total. Fundamentos da revisão: [Lei nº 9.870/1999, art. 1º](https://www.planalto.gov.br/ccivil_03/leis/l9870.htm) e [Decon/CE](https://mpce.mp.br/decon-orienta-consumidores-para-evitar-abusos-em-escolas-particulares/). Conciliação contratual permanece pendente em P-01.

## Exemplos conferíveis

| Caso | Plano | Total sem pontualidade | Total com todas as mensalidades pontuais |
| --- | --- | --- | --- |
| F-01 — Um aluno, ano completo | Inicial 275 + 11 mensalidades | R$ 3.740,00 | R$ 3.575,00 |
| F-02 — Um aluno com benefício de irmãos, ano completo | Inicial 275 + 11 mensalidades com abatimento de 30 cada | R$ 3.410,00 | R$ 3.245,00 |
| F-03 — Dois irmãos, ano completo | Duas iniciais (550) + 11 competências dos dois | R$ 6.820,00 | R$ 6.490,00 |
| F-04 — Um aluno ingressando em agosto | Inicial 275 + 5 mensalidades | R$ 1.850,00 | R$ 1.775,00 |
| F-05 — Um aluno com benefício de irmãos, ingresso em agosto | Inicial 275 + 5 mensalidades com abatimento de 30 cada | R$ 1.700,00 | R$ 1.625,00 |

Em F-03, uma competência dos dois irmãos vale R$ 540,00 pontualmente ou R$ 570,00 após vencimento. Não aplicar 10% sobre R$ 315,00 nem recalcular o benefício como percentual sobre o saldo em atraso. Em F-04, um pagamento pontual de R$ 300,00 em agosto é adicional à inicial de R$ 275,00, ambos já contemplados no total informado; não existem cobranças de fevereiro a julho.

Exemplos pontuais pressupõem liquidação integral de cada mensalidade no prazo. Desconto em pagamento parcial/crédito e ingresso após dia 10 aguardam P-03/P-04; não inventar a fórmula a partir destes totais.

## Movimentações e saldos

- Dívida de R$ 315,00 já vencida, sem irmãos e encargos: recebimento de R$ 100,00 deixa R$ 215,00 devedor.
- Mesma dívida: recebimento de R$ 400,00 quita R$ 315,00 e gera R$ 85,00 de crédito. O crédito precisa de destinação registrada; não quitar outra parcela e devolver os mesmos R$ 85,00.
- Reversão de recebimento incorreto preserva lançamento original e motivo. No exemplo de R$ 100,00, reverter integralmente restaura os R$ 315,00 devidos, se não houver outros movimentos. Se crédito já foi usado ou houve restituição, recompor dependências antes de reverter, sem criar saldo impossível.
- Restituição é dinheiro efetivamente devolvido, registrada separadamente de correção de erro. Aprovar a devolução não significa que ela foi realizada.

## Cancelamento e desistência

| Situação | Regra de planejamento | O que precisa ficar registrado |
| --- | --- | --- |
| Desistência antes das aulas com apenas inicial de R$ 275,00 paga | Devolução integral da inicial, conforme política já adotada; cancelamento das cobranças futuras; vaga liberada se ocupada | Recebimento preservado, crédito/restituição de 275, motivo, data e evidência quando devolvido |
| Desistência antes da confirmação | Não há vaga para liberar; apurar recebimentos/créditos e cancelar obrigações ainda não devidas | Não confirmar matrícula apenas para conseguir cancelar |
| Cancelamento após início das aulas | Cessar cobranças futuras aplicáveis, liberar vaga e apurar valores devidos/créditos | Data efetiva, competências e fundamento; P-05 impede cálculo automático universal do mês de saída |
| Antecipação de meses seguida de cancelamento | Apurar valor correspondente ao período não prestado e descontos negociados | Não presumir perda do saldo ou restituição linear sem examinar o acordo |
| Solicitação de transferência com dívida | Liberar documentos sem exigir quitação ou ciência; registrar saída efetiva separadamente | Dívida pertinente permanece no financeiro; não impedir atendimento por falta de assinatura |

Exemplo isolado de antecipação: se R$ 900,00 foram alocados expressamente a setembro, outubro e novembro (R$ 300,00 cada), o serviço de setembro foi integralmente prestado e a saída ocorre antes de outubro, a parte alocada aos dois meses futuros é R$ 600,00. Este cálculo não decide eventual ajuste da inicial, do mês de saída ou de desconto negociado; esses itens exigem apuração própria em P-05. Não emitir automaticamente restituição total com base apenas neste exemplo.

[Voltar à MD-00](README.md).
