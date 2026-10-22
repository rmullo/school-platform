# Requisitos de produto

> Revisão parcial de 07/10/2026: adequação legal e simplificação arquitetural incorporadas por solicitação do usuário. O detalhamento integral do produto continua por etapas. Nenhum critério foi validado em software.

## Finalidade do documento

Traduzir as adequações da [decisão 0001](decisions/0001-adequacao-legal.md) em comportamentos verificáveis. A [especificação vigente](SPECIFICATION.md) mantém arquitetura e regras gerais; o [mapa normativo](compliance.md) fornece as fontes, e a [matriz](conformidade.md) acompanha pendências.

## Personas

Diretor: campanhas, contratos e negociações; Secretaria: cadastros, matrículas e registros financeiros; TI: operação técnica com menor privilégio. Alunos, representantes legais e contratantes são titulares/interessados, sem portal previsto no MVP. Escola privada de infantil e fundamental em Assaré/CE; médio futuro.

## Pilares funcionais

| ID | Requisito vigente | Critério de aceite documental e futuro comportamento | Origem |
| --- | --- | --- | --- |
| RF-01 | Parcela inicial dentro do total contratado | Plano identifica total nominal, parcela inicial e restantes; soma conciliada e sem duplicação na confirmação. Entrada tardia: inicial mais mensalidades dos meses restantes, sem abatimento automático da inicial, período anterior ou parcela externa ao total. Exemplos na [MD-00](microentregas/MD-00/financeiro.md) | LEG-01 |
| RF-02 | Remover cobrança obrigatória de material coletivo | Nenhuma taxa/entrega coletiva bloqueia matrícula, conclusão ou atendimento; lista distingue material individual de custo institucional | LEG-02 |
| RF-03 | Ajustes, restituições e crédito rastreáveis | Devolução vincula recebimento, motivo, valor e comprovante; não apaga histórico, não duplica restituição/crédito nem reabre dívida cancelada. Desistência antes das aulas devolve integralmente parcela inicial; demais hipóteses seguem política validada | LEG-03 |
| RF-04 | Campanhas com condições transparentes | Contrato, tabela, vagas e calendário têm versão e evidência de divulgação no prazo aplicável; mudança não reescreve condições já aceitas. Desconto de irmãos e pontualidade estão distintos | LEG-04 |
| RF-05 | Separar dívida e direitos escolares | Dívida não impede aulas, provas ou documentos. Renovação analisa contrato pertinente e acordos; ausência de ciência da dívida não impede transferência; não há cancelamento por dívida durante o ano | LEG-05 |
| RF-06 | Representação separada de pagamento | Um contratante financeiro por matrícula; sua condição não concede automaticamente representação, acesso pedagógico ou autorização de retirada. Evidências e restrições têm vigência e acesso limitado | LEG-06 |
| RF-07 | Compras sem venda casada | Compra externa de livros é registrável; aquisição, pagamento e entrega ficam separados da conclusão administrativa. Uniforme é opcional | LEG-07 |
| RF-08 | Finalidade e ciclo de vida dos dados | Inventário especifica finalidade/base/acesso/retenção; campos opcionais não bloqueiam matrícula; direitos do titular têm canal, verificação e resposta fundamentada. Retenção cobre registros, logs, cópias e backups | LEG-08 |
| RF-09 | Controle de acesso e resposta a incidentes | Matriz de permissões limita dados por necessidade; acesso excepcional e revogação são auditáveis; procedimento de incidente registra conhecimento, risco, medidas, decisão e comunicações nos prazos aplicáveis | LEG-09 |
| RF-10 | Avaliar fornecedores e acesso infantil | Antes de nuvem, verificar fluxos internacionais e contratos. Antes de acesso por alunos, reavaliar ECA Digital e proteção adequada ao público | LEG-10 |
| RF-11 | Oferta limitada às autorizações | Etapa possui ato/órgão/validade e capacidade fundamentada; critérios etários e exceções são documentados; novas vagas respeitam renovação de adimplentes. Médio não pode ser ofertado só por habilitação no sistema | LEG-11 |
| RF-12 | Inclusão e acessibilidade | Nenhuma sobretaxa de inclusão ou rejeição automática por deficiência; interface será verificada quanto a teclado, foco, rótulos, contraste e mensagens acessíveis | LEG-12 |
| RF-13 | Distinguir recibo e documento fiscal | Comprovante é identificado como interno; emissão fiscal aplicável ocorre pelo procedimento contábil definido, com referência rastreável, sem simular emissão pelo sistema | LEG-13 |

As fontes de LEG-01 a LEG-13 estão no [mapa normativo](compliance.md). Cenários de aceite acima são especificações para revisão/implementação futura, não testes executados.

## Regras de negócio

Aplicar as seções escolares e financeiras da [especificação](SPECIFICATION.md). Valores antigos permanecem referências até conciliação do contrato; não recalcular preços silenciosamente. Não há exceção administrativa que autorize material coletivo obrigatório, taxa externa à anuidade ou penalidade pedagógica por dívida. Exceções documentais/etárias exigem fundamento, responsável e evidência, sem presumir poder do Diretor para dispensar obrigação legal.

## Requisitos não funcionais

Segurança por menor privilégio, rastreabilidade financeira, prevenção de duplicidade, integridade documental, minimização de dados, retenção justificada e acessibilidade. As tecnologias aprovadas são meios de implementação, não certificados de conformidade. Verificações ficam descritas em [SECURITY.md](../SECURITY.md) e na matriz; infraestrutura segue pausada.

## Critérios da simplificação arquitetural

- Confirmação bem-sucedida persiste matrícula, vaga, parcelas restantes e auditoria conjuntamente. Se uma parte falhar, a transação não confirma parcialmente.
- Duas solicitações disputando a última vaga não podem exceder capacidade. Repetir confirmação ou operação financeira não duplica seus efeitos.
- Cancelamento e ajustes financeiros aplicáveis ficam consistentes na mesma transação. Pagamentos anteriores permanecem rastreáveis; devolução externa é registrada quando efetivada.
- Dashboard consulta PostgreSQL diretamente e reconhece vencimento por data, saldo e situação, sem depender de publicação/consumo de evento.
- O ambiente sobe sem Kafka e sem os três workers. Testcontainers verifica PostgreSQL; Playwright cobre os fluxos de interface. Não criar testes, pacotes ou tabelas de mensageria sem uso.
- Tarefa em segundo plano exige necessidade específica e definição de recuperação/concorrência; não introduzir outra fila para substituir Kafka por antecipação.

São critérios futuros de verificação, não testes executados nesta revisão.

## Decisões técnicas relacionadas

[0001 — Adequação documental aos requisitos legais](decisions/0001-adequacao-legal.md) e [0002 — MVP sem Kafka](decisions/0002-mvp-sem-kafka.md).

## Requisitos a esclarecer

Contrato e listas reais; conciliação contratual do total anual e do plano de entrada tardia (inicial mais meses restantes, fórmula comercial confirmada); tratamento do ingresso após dia 10; política de cancelamento após as aulas; documentos exigíveis por etapa; autorizações e capacidades locais; bases/retenção por categoria; responsáveis e canais; contratos de nuvem; procedimento fiscal. Essas pendências precisam ser resolvidas antes da operação afetada, sem declarar o produto já conforme. A [MD-00](microentregas/MD-00/README.md#pendências-delimitadas) delimita os pontos ainda abertos.

## Fora de escopo

Incremento MD-03: estrutura escolar implementada e em validação na [TASK-0006](tasks/TASK-0006-md03-estrutura-escolar.md), com verificação de capacidade, vínculos, referência administrativa e controle da oferta. Esses testes não encerram o RF-11 completo: atos reais, critérios etários, renovação e operação escolar continuam pendentes nas etapas correspondentes.

Mantidas as exclusões da [especificação](SPECIFICATION.md#fora-do-mvp): cobrança externa automatizada, mensageria automática, agente conversacional, gateway e Serasa. Kafka, Kafka UI, workers separados, Outbox, consumidores e retry/DLQ de mensagens ficam fora do MVP. Ensino médio, portal de alunos e integrações fiscais dependem de etapas futuras; processos manuais necessários às obrigações da escola devem existir antes do uso real.
