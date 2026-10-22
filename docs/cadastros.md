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

### Pessoas e vínculos — MD-04

Implementados `Person` e `StudentProfile`, com vínculos separados para `StudentParentage`, `StudentRepresentation`, `StudentFinancialResponsible` e `PickupAuthorization`. Pessoas possuem nome, contato opcional, data civil de nascimento e versão; evidências e vigências são textuais e não substituem documentos ou autorização jurídica real. Direção/Secretaria acessam o módulo; TI não. A visão administrativa não retorna `createdAt` nem dados de auditoria desnecessários, e possíveis irmãos são apenas sugestões por filiação/responsável financeiro.

### Campanha e plano — MD-05

Implementados `Campaign`, `ContractVersion` e `CampaignOffer`. A campanha guarda ano letivo, período de inscrições, divulgação, calendário, condição de vagas e estado. O plano usa centavos inteiros e impõe `total = parcela inicial + (parcela restante × quantidade)`, mantendo descontos de irmãos e pontualidade separados. Material coletivo obrigatório é proibido; a oferta de turma não modifica ocupação.

### Matrícula em andamento — MD-06

Implementado `EnrollmentDraft`, com aluno, turma, campanha, versão de plano, responsável financeiro vinculado, estado `DRAFT`, snapshot de `initialAmountCents`, pendências e versão. A combinação aluno/turma/campanha/plano é única; o rascunho é auditável, pode ser retomado e não ocupa a capacidade da turma nem cria mensalidades restantes.

### Confirmação e obrigações — MD-07

Implementados `Enrollment`, `InitialSettlement` e `FinancialObligation`. A confirmação preserva o rascunho, registra pagamento manual integral ou dispensa/negociação formal, ocupa a turma com controle concorrente e cria a obrigação inicial liquidada/dispensada mais as parcelas restantes abertas. A chave de operação evita duplicidade; pagamentos parciais, créditos, reversões e restituições ainda não fazem parte deste cadastro.

### Contas e sessões — MD-02

Esquema técnico inicial implementado na [MD-02](microentregas/MD-02/README.md): conta com UUID, nome, e-mail normalizado único, hash Argon2id, perfil, situação e criação; sessão com usuário, hash do refresh, família, criação, expiração, consumo e revogação; evento de auditoria com responsável, ação, conta afetada, motivo e instante. Senha e refresh em texto não são persistidos. Listas públicas de contas não incluem hashes. Retenção operacional e políticas de recuperação continuam pendentes; não presumir guarda ilimitada.

Campos exatos serão detalhados na etapa de cadastros. Dados de saúde, deficiência e decisões judiciais exigem necessidade comprovada e acesso restrito. Não exigir laudo indiscriminadamente nem usar necessidades de apoio para rejeição automática. Não incluir dados reais nos exemplos.

## Relacionamentos

### Estrutura escolar — MD-03

Implementados SchoolYear (ano e período civil), SchoolStage (nome/segmento/referência administrativa), SchoolGrade (nome/etapa) e Classroom (nome/ano/série/capacidade/ocupação/oferta). Vínculos possuem chaves estrangeiras; nomes são únicos no respectivo contexto, inclusive sem diferenciar caixa. Ocupação não é editável pela API e tem restrição `0 <= ocupação <= capacidade`, com capacidade positiva. Edições usam versão esperada e motivo. Eventos de auditoria registram estados anterior/posterior sem senhas. Detalhes, limites técnicos e demonstração: [MD-03](microentregas/MD-03/README.md).

Aluno tem matrículas ao longo dos anos; cada matrícula tem um contratante financeiro. Uma pessoa pode acumular papéis, mas cada vínculo precisa de fundamento próprio. Representação legal pode envolver mais de uma pessoa e não deve herdar a cardinalidade do contratante. Compartilhar pagador apenas sugere conferência de benefício comercial; não comprova irmandade.

## Ciclo de vida e histórico

Correções preservam a trilha necessária, com acesso restrito e retenção justificada. Manter termos contratuais aceitos e ajustes posteriores sem sobrescrita. Exclusão/anonimização depende da categoria, obrigação de guarda e impedimentos documentados; não apagar provas contábeis automaticamente nem manter todos os anexos para sempre. Aplicar o mesmo planejamento a auditoria, logs, cópias e backups.

## Questões abertas

Inventário de campos, base legal por tratamento, prova suficiente de representação, prazos de guarda, categorias de documentos obrigatórios e classificação da lista real. Não estabelecer números ou documentos universais sem fundamento. Referências: [especificação](SPECIFICATION.md), [PRD](prd.md) e [matriz](conformidade.md).
