# Planejamento anterior de eventos e Kafka

> Histórico substituído em 07/10/2026 pela [decisão 0002](../decisions/0002-mvp-sem-kafka.md). Não é requisito do MVP nem contrato de integração vigente. A eventual retomada exige nova decisão e revisão dos contratos.

O texto abaixo preserva o planejamento anterior à simplificação. Consulte a [especificação vigente](../SPECIFICATION.md) para os fluxos atuais.

## Eventos e Kafka
Tópicos: school.enrollment.events.v1, school.billing.events.v1, school.payment.events.v1.
Tipos: enrollment.confirmed, enrollment.completed, enrollment.canceled, billing.charges.generated, billing.charge.overdue, payment.registered, payment.reversed.
Envelope: eventId, eventType, version, aggregateId, correlationId, occurredAt, data.
Versão 1 no campo version e no tópico; eventType sem sufixo .v1, conforme exemplo e decisão final.
Chave por matrícula para eventos de matrícula e por cobrança para pagamentos, preservando ordem relevante por partição.
Consumer groups independentes e estáveis; múltiplas réplicas distribuem partições.
Transação de domínio insere Outbox; publisher entrega ao Kafka; consumidores deduplicam por eventId + consumer atomicamente com seus efeitos.
Falhas transitórias: três tentativas iniciais e DLQ. A política final deverá preservar rastreabilidade e permitir reprocessamento.
enrollment.confirmed gera mensalidades; enrollment.canceled cancela cobranças futuras; pagamentos/reversões atualizam projeções; vencimentos atualizam inadimplência.
Geração usa o plano contratado, abatendo cobranças iniciais já existentes, sem duplicação. Projeções devem refletir ajustes, restituições e créditos; os contratos de evento correspondentes serão detalhados na etapa de eventos, antes da implementação desses movimentos. Não reutilizar payment.reversed como sinônimo automático de restituição financeira.
O processamento de vencimentos não envia cobrança externa.
Dashboard restrito a perfis autorizados mostra mensalidades vencidas, total vencido, contratos/contratantes com pendências e parcelas atrasadas. Agrupamento familiar, se necessário, é apenas visualização autorizada: não transfere dívidas nem gera bloqueio de irmãos. Evitar exposição pública ou constrangimento.
Kafka não substitui REST nem PostgreSQL. Schema Registry/Avro é evolução futura.
