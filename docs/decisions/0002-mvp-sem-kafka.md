# 0002 — MVP com transações PostgreSQL, sem Kafka

## Contexto

Kafka era obrigatório no planejamento original, inclusive como objetivo de aprendizado. Após avaliar o impacto no prazo, o usuário autorizou em 07/10/2026 atualizar a documentação conforme a proposta de adiá-lo e priorizar a entrega do sistema escolar.

## Decisão

Manter NestJS como monólito modular, frontend React e PostgreSQL. A API coordena os casos de uso entre módulos no mesmo processo. Preservar monorepo, Prisma, validação, armazenamento de documentos, autenticação, auditoria e requisitos legais.

| Planejamento anterior | Planejamento vigente para o MVP |
| --- | --- |
| API e billing-worker, projection-worker, outbox-publisher | Uma API modular, além do frontend |
| Kafka KRaft e Kafka UI no ambiente local | Sem broker ou painel de mensageria |
| Confirmação publica evento para gerar mensalidades | Confirmação, vaga, parcelas ainda inexistentes e auditoria na mesma transação PostgreSQL |
| Consumidores e projeções financeiras assíncronas | Operações transacionais e consultas diretas ao PostgreSQL |
| Transactional Outbox, retry e DLQ de mensagens | Fora do MVP; transações, validações, prevenção de duplicidade e tratamento de erros continuam necessários |
| Contratos/tópicos de evento e testes Kafka | Histórico; testes de domínio, PostgreSQL e interface permanecem |
| MSK previsto na infraestrutura futura | Sem requisito de MSK; reavaliar apenas se houver futura decisão por Kafka |

Não substituir Kafka por outra fila, broker, eventos em memória ou workers genéricos por antecipação. Tarefas em segundo plano dependem de necessidade concreta e desenho que considere falhas e concorrência; não são necessárias para identificar vencimentos nas consultas.

## Consequências

O ambiente planejado contém apps/api, apps/web, PostgreSQL e MinIO, além das ferramentas de desenvolvimento e observabilidade já aprovadas. Pacotes compartilhados atendem contratos e utilidades efetivamente necessários; não criar infraestrutura de eventos sem uso.

Repetir uma requisição não pode duplicar parcela, pagamento, crédito ou restituição. Concorrência sobre vagas e saldos continua protegida por transações e restrições adequadas no banco. Em falha, desfazer as alterações da operação, sem apagar recebimentos anteriores válidos.

Retorno de sucesso das operações centrais pressupõe confirmação da transação. Relatórios leem o estado persistido, sem aguardar consumidores. Transações do banco não tornam atômicos uploads ou movimentações externas de dinheiro; esses fluxos terão estados e procedimentos próprios.

Kubernetes e AWS continuam possibilidades de implantação posterior. Esta decisão simplifica o MVP e não certifica escalabilidade ou conformidade operacional. Não autoriza iniciar código nesta etapa documental.

## Alternativas consideradas

Manter Kafka desde a fundação foi adiado pelo custo de desenvolvimento e operação neste momento. Manter Outbox sem integração assíncrona concreta também foi adiado. Reintroduzir mensageria será uma nova decisão, com necessidade demonstrada de integração, processamento independente ou escala.

## Pontos em aberto

Detalhar os limites transacionais, chaves de operação, concorrência e recuperação de arquivos em cada entrega. Se surgirem tarefas programadas, definir execução segura para múltiplas instâncias. A eventual retomada de eventos exige rever contratos e retenção; o histórico não obriga compatibilidade.

## Origem e referências

- Conversa de 07/10/2026: preocupação do usuário com atraso causado por Kafka, proposta de simplificação e instrução “atualize a documentação conforme estas decisões”.
- [Especificação vigente](../SPECIFICATION.md).
- [Planejamento anterior de eventos](../historico/eventos-planejados.md), preservado somente para rastreabilidade.
- [Decisão 0001](0001-adequacao-legal.md): adequações legais continuam vigentes.

## Histórico de revisão

- 07/10/2026: simplificação autorizada e incorporada à documentação.
- 08/10/2026: revisão de consistência concluída entre especificação, PRD, módulos, segurança, roadmap e registros históricos. Implementação permanece pausada.
