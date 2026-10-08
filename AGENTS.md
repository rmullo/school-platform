# SmartSchool

- Desde 06/10/2026, o usuário determinou documentação primeiro, uma etapa por vez, sob sua orientação. Não retomar implementação ou avançar para outra etapa por iniciativa própria.
- Em 07/10/2026, o usuário solicitou excluir toda a implementação anterior e manter somente a documentação para o GitHub. Não recriar código, dependências, infraestrutura ou automações de build sem nova solicitação.
- Começar pelo índice docs/README.md. Consultar a situação de cada documento; alguns já têm adequações legais autorizadas. Não confundir requisitos documentados com controles implementados.
- docs/SPECIFICATION.md contém o planejamento vigente, incluindo a adequação legal autorizada em 07/10/2026 e registrada em docs/decisions/0001-adequacao-legal.md. Histórico e conversa recuperada não sobrepõem regras substituídas; preservar sua rastreabilidade.
- A decisão docs/decisions/0002-mvp-sem-kafka.md retira Kafka, Kafka UI, os três workers, Outbox, consumidores e retry/DLQ de mensagens do MVP. Usar planejamento transacional no PostgreSQL; não recriar mensageria por referência ao histórico.
- Preservar decisões aprovadas e registrar divergências; não inventar valores dos anexos indisponíveis.
- Em alterações apenas documentais, conferir links e coerência; não é necessário subir aplicações ou executar a suíte de código.
- Os guias em docs/historico descrevem uma implementação removida. Seus comandos não estão disponíveis neste repositório documental.
- Não versionar .env, dados pessoais ou dumps. Não remover volumes para resolver problemas sem autorização.
- Nunca modificar referências sincronizadas em sources/ do projeto que contém este repositório, quando essa pasta estiver presente.
