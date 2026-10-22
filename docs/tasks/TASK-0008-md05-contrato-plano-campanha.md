# TASK-0008 — MD-05: contrato, plano e campanha

- **Microentrega:** MD-05 — Contrato, plano e campanha.
- **Estado:** Concluída.
- **Dependências:** MD-00 (regras financeiras), MD-03 (ano letivo, séries e turmas), MD-04 (pessoas e vínculos aceita pelo usuário).
- **Autorização:** o usuário solicitou “conclua o md 05. 4 aceita” em 22/10/2026; a implementação desta tarefa foi iniciada após registrar o escopo abaixo.

## Escopo

Implementar, com dados fictícios de demonstração:

- campanha versionada por ano letivo, com período, divulgação, calendário e condição de vagas;
- versão de contrato/plano financeiro com composição anual exata em centavos;
- parcela inicial incluída no total, quantidade e valor das parcelas restantes;
- descontos de irmãos e pontualidade registrados separadamente;
- associação da campanha às turmas ofertadas, sem ocupar vagas;
- alteração otimista por versão e auditoria das mudanças;
- acesso restrito à Direção; Secretaria e TI não administram campanha e contrato nesta etapa.

Ficam fora: matrícula, aceite de contrato, geração de obrigações, cobrança, pagamento, negociação, uso de dados reais e publicação externa.

## Critérios de aceite

- [x] O total anual é validado no servidor como parcela inicial + parcelas restantes.
- [x] O material coletivo obrigatório permanece proibido no contrato/plano.
- [x] Desconto de irmãos e desconto de pontualidade são campos distintos e não são aplicados automaticamente a uma matrícula.
- [x] Campanha, contrato e oferta de turma possuem versão/auditoria; atualização não reescreve histórico de termos já registrados.
- [x] Uma campanha pode indicar calendário, divulgação e turmas ofertadas sem alterar a ocupação.
- [x] Direção consegue cadastrar, corrigir e consultar; perfis sem permissão recebem bloqueio no servidor.
- [x] Estados de carregamento, vazio, erro, envio e sucesso são compreensíveis na interface.
- [x] Testes proporcionais e documentação afetada são atualizados com resultados reais.

## Alterações realizadas

- Banco: modelos `Campaign`, `ContractVersion` e `CampaignOffer`, com migração PostgreSQL, restrição de composição e proibição de material coletivo obrigatório.
- Contratos: schemas compartilhados para campanhas, planos, ofertas e visão consolidada.
- API: módulo `commercial`, autorização exclusiva da Direção, transações, controle de versão, auditoria e validação de mesmo ano entre campanha e turma.
- Web: tela **Campanhas e planos**, formulários MUI/RHF, consulta/erro/sucesso, composição em centavos e verificação móvel.
- Testes: unitário, integração PostgreSQL e jornada Playwright.

## Verificações

| Data | Comando/cenário | Resultado |
| --- | --- | --- |
| 22/10/2026 | `pnpm build` | Aprovado; cinco pacotes compilados |
| 22/10/2026 | `pnpm typecheck` | Aprovado; oito tarefas Turbo concluídas |
| 22/10/2026 | `pnpm test` | 17 testes unitários aprovados |
| 22/10/2026 | `pnpm test:integration -- tests/integration/commercial.test.ts` | 27 testes aprovados na configuração, incluindo campanha/plano/oferta |
| 22/10/2026 | `pnpm exec playwright test tests/e2e/commercial.spec.ts --workers=1` | 1 jornada aprovada; captura móvel e largura conferidas |
| 22/10/2026 | `docker compose up -d --build --wait` | Imagens recriadas, migração aplicada e serviços saudáveis; volumes preservados |

## Roteiro manual

Usar o [guia da MD-05](../microentregas/MD-05/README.md), sempre com dados fictícios. Conferir soma da parcela inicial com as restantes, edição com motivo, separação dos descontos, bloqueio de material coletivo obrigatório e associação sem alteração de ocupação.

## Limitações e retorno

Esta tarefa não autoriza matrícula, cobrança, pagamento, publicação ou dados reais. O plano cadastrado é preparatório e não representa aceite contratual de pessoa real.

## Aceite

- Aceite do usuário: confirmado em 22/10/2026 — “md 5 aceito”.
- Commit/PR: não criado nesta tarefa.
- Publicação: não realizada.

## Feedback e ajustes

| Data | Retorno do usuário | Ação tomada ou tarefa vinculada | Situação |
| --- | --- | --- | --- |
| 22/10/2026 | “conclua o md 05. 4 aceita” | MD-04 encerrada na TASK-0007; MD-05 executada nesta TASK-0008 | Em validação |
| 22/10/2026 | “md 5 aceito” | Aceite explícito da MD-05 registrado | Concluída |
