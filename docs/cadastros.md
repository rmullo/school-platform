# Dicionário de dados dos cadastros

> Revisão parcial de 07/10/2026: conceitos afetados pela adequação legal. Sem esquema físico de banco ou lista definitiva de dados obrigatórios.

## Convenções

Antes de incluir um campo, registrar significado, finalidade, base legal, necessidade, origem, acesso e retenção. Fonte: [LEG-06 a LEG-09](compliance.md). Não coletar dados apenas porque podem ser úteis no futuro; bases e prazos concretos dependem do inventário operacional.

## Catálogo de cadastros

| Conceito | Conteúdo mínimo a detalhar | Limites |
| --- | --- | --- |
| Aluno | Identidade contínua, vínculos com matrículas | Identidade contínua não significa retenção ilimitada |
| Filiação | Vínculos efetivamente conhecidos/documentados | Não exigir composição familiar artificial nem presumir poderes legais |
| Representação legal | Pessoa, natureza, evidência necessária, vigência, restrições | Distinguir de contratante e de autorização de retirada |
| Responsável financeiro/contratante | Pessoa contratante, contrato e obrigações assumidas | Um por matrícula; não atribuir dívida automaticamente aos pais ou irmãos |
| Autorização específica | Finalidade, pessoa autorizada, vigência e origem | Pagamento não autoriza retirada, consentimento ou acesso pedagógico |
| Campanha/contrato | Etapa, versão, divulgação, datas, vagas e condições | Preservar termos aceitos; documentos preenchidos ficam fora do Git |
| Plano financeiro | Total do período, parcela inicial, demais parcelas, descontos e negociações | Parcela inicial incluída; origem e diferença rastreáveis |
| Movimentação financeira | Recebimento, alocação, ajuste, reversão, crédito e restituição | Manter vínculos e impedir dupla destinação do crédito |
| Documento escolar | Categoria, finalidade, referência de arquivo, versão e situação | Exigir apenas o necessário; acesso e retenção por categoria |
| Livro/material individual | Natureza, justificativa e forma de aquisição/entrega | Não criar obrigação de material coletivo nem bloqueio de matrícula |
| Autorização da etapa | Órgão, ato, validade e evidência da capacidade | Confirmar ato real; não inferir autorização pelo cadastro |

## Campos e validações

Campos exatos serão detalhados na etapa de cadastros. Dados de saúde, deficiência e decisões judiciais exigem necessidade comprovada e acesso restrito. Não exigir laudo indiscriminadamente nem usar necessidades de apoio para rejeição automática. Não incluir dados reais nos exemplos.

## Relacionamentos

Aluno tem matrículas ao longo dos anos; cada matrícula tem um contratante financeiro. Uma pessoa pode acumular papéis, mas cada vínculo precisa de fundamento próprio. Representação legal pode envolver mais de uma pessoa e não deve herdar a cardinalidade do contratante. Compartilhar pagador apenas sugere conferência de benefício comercial; não comprova irmandade.

## Ciclo de vida e histórico

Correções preservam a trilha necessária, com acesso restrito e retenção justificada. Manter termos contratuais aceitos e ajustes posteriores sem sobrescrita. Exclusão/anonimização depende da categoria, obrigação de guarda e impedimentos documentados; não apagar provas contábeis automaticamente nem manter todos os anexos para sempre. Aplicar o mesmo planejamento a auditoria, logs, cópias e backups.

## Questões abertas

Inventário de campos, base legal por tratamento, prova suficiente de representação, prazos de guarda, categorias de documentos obrigatórios e classificação da lista real. Não estabelecer números ou documentos universais sem fundamento. Referências: [especificação](SPECIFICATION.md), [PRD](prd.md) e [matriz](conformidade.md).
