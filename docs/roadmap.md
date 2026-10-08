# Roadmap

## Etapa atual — revisão da documentação

Em 06/10/2026, o usuário orientou priorizar a documentação e conduzir o trabalho passo a passo. A implementação está pausada por essa orientação.

Em 07/10/2026, o usuário solicitou remover a implementação existente e preparar um repositório apenas documental para o GitHub. O trabalho atual segue restrito à documentação.

Em 07/10/2026, o usuário autorizou adequar a documentação aos achados legais. Especificação, PRD, dados, módulos e segurança receberam essa revisão; o [índice](README.md) distingue documentos parciais e pendências. O modelo de organização continua baseado no OpenClinic.

## Pendências antes do uso real

- Conciliar contrato, total anual, descontos, entrada tardia e política de restituição com as regras revisadas.
- Conferir lista de materiais, documentos exigíveis e atos de autorização/capacidade por etapa.
- Definir bases legais, retenção, representação, responsáveis, canais e procedimentos de privacidade/incidentes.
- Confirmar procedimento fiscal e contratos/fluxos de fornecedores antes das operações correspondentes.
- Implementar e verificar os critérios do PRD somente quando o usuário autorizar desenvolvimento.

Esses pontos são condições de prontidão, não declaração de que a escola esteja irregular nem exigência de construir integrações fora do MVP. Ensino médio permanece futuro. A [matriz](conformidade.md) acompanha o que falta comprovar.

## Arquitetura de implementação vigente

A [decisão 0002](decisions/0002-mvp-sem-kafka.md) adia Kafka, Kafka UI, os três workers, Outbox e o processamento por mensagens. Planejar uma API NestJS modular, frontend React, PostgreSQL e MinIO; manter os demais requisitos de desenvolvimento e observabilidade aprovados. Relatórios consultam o banco e operações centrais são transacionais.

A fundação futura deve iniciar do zero conforme o README, sem dependências de mensageria. A primeira matrícula completa inclui plano financeiro, pagamento inicial, confirmação e parcelas restantes; não adiar consistência financeira para uma etapa de eventos. A verificação cobre rollback, disputa de vaga e repetição de operações, além de permissões e interface.

Kubernetes/AWS permanecem posteriores. Retomar mensageria exige benefício concreto e nova decisão; não existe compromisso de introduzi-la ao final do MVP. A elaboração segue sob orientação do usuário, sem iniciar implementação nesta revisão.

## Próximas etapas

A sequência de elaboração será indicada pelo usuário. Não há início automático da próxima etapa nem datas de implementação definidas nesta revisão.

## Sequência técnica vigente

A sequência técnica foi ajustada na [especificação](SPECIFICATION.md#sequência-aprovada) para os fluxos transacionais sem Kafka. Ela não é uma autorização para retomar a implementação agora.

## Modelo para detalhar uma etapa

- Objetivo.
- Documentos envolvidos.
- Perguntas a resolver.
- Resultado esperado.
- Situação da revisão.
