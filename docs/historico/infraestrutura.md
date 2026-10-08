# Notas anteriores sobre infraestrutura

> Arquitetura substituída pela [decisão 0002](../decisions/0002-mvp-sem-kafka.md): Kafka e workers não integram o MVP vigente. Conteúdo preservado apenas como histórico.

Registro documental preservado da implementação removida em 07/10/2026.

## Kubernetes

O planejamento anterior previa Kustomize na Fase 12. A antiga fundação possuía imagens sem estado, usuário sem root, endpoints de saúde, configuração por ambiente e tratamento de SIGTERM. Esses arquivos de implementação foram removidos.

Deployments, secrets externos, Ingress/TLS, recursos, políticas e múltiplas réplicas não haviam sido implementados ou validados.

## AWS

O destino aprovado no planejamento anterior incluía EKS, RDS PostgreSQL, MSK, S3, ECR, Secrets Manager, CloudWatch e ALB, com provisionamento posterior via Terraform. Nenhum recurso AWS foi criado na etapa anterior.

As decisões de planejamento permanecem na [especificação consolidada](../SPECIFICATION.md).
