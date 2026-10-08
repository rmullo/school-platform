# Mapa de requisitos normativos e documentais

> Levantamento e adequação documental em 07/10/2026, com fontes oficiais. Correções incorporadas por solicitação do usuário. Não constitui parecer jurídico nem certificação: contrato, enquadramentos locais e evidências operacionais permanecem pendentes.

## Contexto e alcance

O usuário confirmou escola **privada em Assaré/CE**, com **educação infantil e ensino fundamental**. O ensino médio é uma expansão futura. O SmartSchool será inicialmente interno, utilizado por Diretor, Secretaria e TI.

Foram confrontados os requisitos disponíveis em [SPECIFICATION.md](SPECIFICATION.md) com normas federais, orientações do MPCE/Decon e referências educacionais locais. Após o levantamento, o usuário autorizou a adequação documental. As diretrizes abaixo orientam a especificação vigente e o [PRD](prd.md), conforme a [decisão 0001](decisions/0001-adequacao-legal.md). Não há implementação ou validação da operação escolar. A [decisão 0002](decisions/0002-mvp-sem-kafka.md) simplifica o MVP sem Kafka, preservando estas obrigações.

O contrato, ficha de matrícula, lista de materiais, planilhas e imagens citados na conversa anterior não estavam disponíveis para inspeção. Não foi possível verificar cláusulas assinadas, listas efetivas, CNPJ, regime tributário ou atos de autorização da escola. A pesquisa não é uma auditoria exaustiva da operação escolar, trabalhista, predial ou tributária.

## Correções incorporadas em relação ao escopo anterior

### LEG-01 — Matrícula e anuidade

A especificação anterior tratava matrícula como taxa independente da anuidade; essa regra foi substituída. A Lei nº 9.870/1999, art. 1º, prevê valor anual contratado e admite planos alternativos que não o excedam. O MPCE/Decon orienta que a matrícula integre o total contratual. Fontes: [Lei nº 9.870/1999](https://www.planalto.gov.br/ccivil_03/leis/l9870.htm) e [Decon, Recomendação nº 01/2020](https://mpce.mp.br/decon/legislacao/).

**Diretriz incorporada:** distinguir matrícula operacional de parcela financeira inicial. Onze mensalidades mais uma parcela inicial não são, por si, o problema; o conflito é cobrar matrícula além da anuidade anunciada. O contrato deve declarar o total anual e suas parcelas. Não recalcular valores aprovados antes de revisar contrato e descontos.

**Detalhamento de 08/10/2026:** a [decisão 0003](decisions/0003-ingresso-durante-o-ano.md) registra a regra comercial confirmada para ingresso tardio: inicial mais meses restantes. A [MD-00](microentregas/MD-00/financeiro.md) calcula exemplos usando os valores de referência existentes, sem alterar tabela ou contrato. Essa composição deve estar incluída no total informado; sua confirmação comercial não substitui a revisão contratual pendente.

### LEG-02 — Material coletivo obrigatório

A antiga exigência de material coletivo ou taxa substitutiva como condição de conclusão conflita com o art. 1º, § 7º, da Lei nº 9.870/1999: material coletivo necessário ao serviço deve integrar a anuidade. A opção entre itens e taxa não elimina a obrigatoriedade. Fontes: [lei federal](https://www.planalto.gov.br/ccivil_03/leis/l9870.htm) e [Decon sobre material e matrícula](https://mpce.mp.br/decon-orienta-consumidores-para-evitar-abusos-em-escolas-particulares/).

**Diretriz incorporada:** não exigir essa cobrança nem usar material coletivo como impedimento. Examinar a lista real para distinguir material individual de insumos coletivos. Mudar apenas o nome da taxa não resolve o conflito.

### LEG-03 — Cancelamento, devolução e crédito

“Preservar pagamentos” deve significar manter o histórico, não reter automaticamente todo valor recebido. O Decon orienta devolução da matrícula na desistência antes das aulas. O CDC exige examinar cláusulas abusivas e prevê arrependimento em contratações fora do estabelecimento, nas condições do art. 49. Fontes: [Decon](https://mpce.mp.br/decon-orienta-consumidores-para-evitar-abusos-em-escolas-particulares/) e [CDC, arts. 39, 49 e 51](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm).

**Diretriz incorporada:** preservar lançamentos e registrar restituições/ajustes vinculados, com motivo, valor e autorização. Adotar devolução integral da parcela inicial na desistência antes das aulas como política do projeto. Detalhar cancelamentos após as aulas, antecipações e saldo credor sem presumir retenção ou devolução integral em todos os cenários.

## Contratação e financeiro

### LEG-04 — Campanhas, descontos e transparência

Contrato proposto, total anual e vagas por sala devem ser divulgados ao menos 45 dias antes da data final de matrícula; a lei veda reajustes inferiores a um ano nas condições estabelecidas. Campanhas sucessivas não afastam essas obrigações. Fonte: [Lei nº 9.870/1999, arts. 1º e 2º](https://www.planalto.gov.br/ccivil_03/leis/l9870.htm).

**Diretriz incorporada:** versionar contrato, tabela anual, descontos, divulgação e condições aceitas. Corrigir a divergência entre o contrato antigo e a regra aprovada de irmãos. O STJ reconhece o desconto de pontualidade em contexto de anuidade definida e benefício pactuado; isso não valida automaticamente qualquer fórmula. Fonte: [STJ, Informativo nº 591, REsp 1.424.814/SP](https://processo.stj.jus.br/jurisprudencia/externo/informativo/?acao=pesquisarumaedicao&from=feed&livre=0591.cod.).

O CDC limita a multa moratória a 2% da prestação e proíbe cobrança vexatória. Manter multa/juros padrão zero é compatível com a proposta atual; eventual alteração exige cláusula e fundamento próprios, sem assumir percentual universal de juros. Fonte: [CDC, arts. 42 e 52, § 1º](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm).

### LEG-05 — Inadimplência, renovação e transferência

A lei admite exceção por inadimplência ao direito de renovação, mas veda penalidades pedagógicas e retenção de documentos. Desligamento por dívida na educação básica só pode ocorrer ao final do ano letivo. Fonte: [Lei nº 9.870/1999, arts. 5º e 6º](https://www.planalto.gov.br/ccivil_03/leis/l9870.htm).

**Diretriz incorporada:** separar recusa de renovação de cancelamento durante o ano. Ciência da dívida não pode condicionar transferência. Delimitar a análise à relação contratual pertinente, sem bloqueio automático por dívida de irmão, outro aluno ou outra escola. O Decon recomenda não exigir quitação da escola anterior. Fonte: [Decon, Recomendação nº 01/2020](https://mpce.mp.br/decon/legislacao/).

### LEG-06 — Contratante, filiação e representação legal

Pagar não concede automaticamente poderes de representação do aluno. O ECA protege intimidade, imagem e participação dos pais/responsáveis no processo pedagógico. O STJ afastou cobrança contra pais que não participaram de contrato celebrado por terceiro estranho à família. Fontes: [ECA, arts. 17 e 53](https://www.planalto.gov.br/ccivil_03/leis/l8069.htm) e [STJ, decisão divulgada em 24/07/2023](https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2023/24072023-Pais-nao-podem-ser-cobrados-por-divida-escolar-se-o-contrato-foi-celebrado-por-terceiro.aspx/).

**Diretriz incorporada:** manter um responsável financeiro por matrícula, distinguindo filiação, responsável legal, autorização de retirada e acesso a dados. Registrar representação e restrições judiciais com acesso limitado. Compartilhar responsável financeiro não prova parentesco nem solidariedade por dívida.

### LEG-07 — Livros, materiais individuais e uniformes

O CDC proíbe venda casada; o Decon adverte contra impor compras na escola ou fornecedores específicos. Fontes: [CDC, art. 39, I](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm) e [Decon](https://mpce.mp.br/decon-orienta-consumidores-para-evitar-abusos-em-escolas-particulares/).

**Diretriz incorporada:** preservar compra externa de livros e venda opcional de uniformes. Compra, pagamento e entrega não condicionam confirmação ou conclusão administrativa. Revisar kits exclusivos antes de oferta; pendência administrativa não deve gerar sanção pedagógica. Pagamento, entrega e atendimento educacional permanecem distintos.

## Dados pessoais e segurança

### LEG-08 — LGPD e dados de crianças

A LGPD exige finalidade, necessidade, base legal, transparência, direitos dos titulares e segurança. Dados de saúde/deficiência são sensíveis; dados de crianças não são automaticamente todos sensíveis. Retenção exige finalidade e fundamento, não prazo infinito por padrão. Fonte: [LGPD, arts. 5º–7º, 11, 14–18 e 46](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).

O Enunciado ANPD nº 1/2023 admite as bases dos arts. 7º ou 11, sempre com prevalência do melhor interesse. Consentimento não é a única base possível. Quando utilizado para criança, deve observar o art. 14; autorização genérica do pagador não basta. Fontes: [Enunciado ANPD nº 1/2023](https://bibliotecadigital.mj.gov.br/bitstream/1/10215/2/Enunciado_ANPD_2023_1.html) e [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).

**Diretriz incorporada:** inventariar dados/finalidades/bases; separar campos obrigatórios e opcionais; preparar aviso de privacidade e atendimento a solicitações; definir retenção por categoria, incluindo banco, backups, anexos, auditoria e logs. A eventual introdução de mensageria exigirá revisão adicional de retenção. “Cadastro permanente” significa continuidade de identidade, não guarda irrestrita de todo dado.

### LEG-09 — Responsabilidades, acesso e incidentes

A escola tende a ser controladora dos tratamentos que decide; fornecedor que trata dados sob suas instruções pode ser operador. A qualificação depende da atividade real, não só do contrato. Fonte: [ANPD, guia de agentes de tratamento](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/2021.05.27GuiaAgentesdeTratamento_Final.pdf).

**Requisito técnico de planejamento:** contas individuais, menor privilégio, anexos restritos, backups recuperáveis, auditoria e revogação de acesso de funcionários desligados. TI não deve acessar documentos de alunos irrestritamente por padrão. São medidas de segurança; a escolha de tecnologias específicas não comprova cumprimento legal. Referência de boas práticas: [guia de segurança da ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/anonimizado___guia_orientat-_seg_da_inf_p_atpp.pdf).

Incidentes com risco ou dano relevante têm regra geral de comunicação pelo controlador à ANPD e aos titulares em três dias úteis, contados do conhecimento de que afetaram dados pessoais, ressalvadas hipóteses aplicáveis. Registros de incidentes devem ser mantidos por pelo menos cinco anos. Fontes: [ANPD, comunicação de incidentes](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis?sck=direto) e [explicação oficial da Resolução nº 15/2024](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca).

Não presumir dispensa de encarregado ou prazo diferenciado pelo tamanho da escola: avaliar enquadramento e risco. Tratar dados de crianças, isoladamente, não satisfaz todos os critérios de alto risco do regulamento. Fonte: [Resolução ANPD nº 2/2022](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022).

### LEG-10 — Nuvem e expansão digital

AWS não é proibida, mas transferências internacionais exigem mecanismo válido, transparência e garantias. Região brasileira não encerra a análise: verificar suporte, suboperadores, réplicas e backups. Fonte: [Resolução ANPD nº 19/2024](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024).

O ECA Digital vigora desde 17/03/2026 e alcança produtos/serviços direcionados a crianças ou de acesso provável por elas. **Enquadramento pendente:** armazenar cadastros infantis em sistema exclusivamente administrativo não basta, por si só, para concluir incidência de todas essas regras. Reavaliar antes de portal/app para alunos, considerando os regulamentos aplicáveis. Fonte: [Lei nº 15.211/2025, arts. 1º e 41-A](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm).

## Educação, inclusão e funcionamento local

### LEG-11 — Autorização por etapa e registros escolares

A LDB inclui, como regra, educação infantil privada no sistema municipal e fundamental/médio privados no estadual. Exige autorização e avaliação pelo poder público; o sistema administrativo não substitui escrituração e documentos escolares. Fonte: [LDB, arts. 7º, 17, 18, 24 e 31](https://www.planalto.gov.br/ccivil_03/leis/l9394.htm).

**Pendência local:** obter atos vigentes da escola e confirmar competência com CME de Assaré e CEE/CE, incluindo eventual articulação entre sistemas para escolas com várias etapas. Foi localizada [resolução no portal municipal](https://assare.ce.gov.br/conselhoarquivo/16/7/resolucao.pdf), cuja leitura integral e identificação não puderam ser concluídas nesta pesquisa. Não se atestam autorização, capacidade por turma ou prazo de guarda a partir desse arquivo.

Referências estaduais: [SISP/CEE e credenciamento](https://sisp.cee.ce.gov.br/view/escola/loginEscola.aspx) e [Resolução CEE nº 523/2025, educação infantil no sistema estadual](https://legislacao.cee.ce.gov.br/publicacoes/resolucao-cee-no-5232025-2025/). Esta última não se aplica automaticamente à escola sem confirmar seu enquadramento.

A matrícula inicial na pré-escola e no fundamental tem regras nacionais de idade e corte em 31 de março, considerando situações de continuidade. Fontes: [CNE, Parecer nº 2/2018](https://portal.mec.gov.br/docman/setembro-2018-pdf/97071-pceb002-18/file) e [Resolução CNE/CEB nº 2/2018 no catálogo oficial](https://portal.mec.gov.br/pec-g/323-secretarias-112877938/orgaos-vinculados-82187207/59321-resolucoes-ceb-2018).

**Diretriz incorporada:** documentar critérios por etapa/ano e exceções autorizadas, sem inventar limite único de turma ou prazo único de descarte. A expansão para ensino médio exige revisão regulatória e autorização própria antes da oferta; não integra automaticamente o MVP.

### LEG-12 — Inclusão e acessibilidade

A Lei Brasileira de Inclusão exige educação inclusiva e veda acréscimos em mensalidades, anuidades e matrículas para cumprir as obrigações do art. 28 nas escolas privadas. Também disciplina acessibilidade de sites de empresas no art. 63. Fonte: [Lei nº 13.146/2015](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm).

**Diretriz incorporada:** não permitir sobretaxa de inclusão nem recusa automática por deficiência; tratar necessidades de apoio com acesso restrito e planejar interface acessível. Acessibilidade ainda não foi implementada ou auditada.

### LEG-13 — Obrigações fiscais e documentos

Serviços educacionais aparecem no item 8.01 da lista da LC nº 116/2003. Comprovante interno de pagamento não equivale automaticamente a documento fiscal. Fonte: [LC nº 116/2003](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm).

**Pendente com a contabilidade:** confirmar regime, regras atuais de NFS-e de Assaré, tributação/documentação de livros e uniformes e efeitos da transição tributária de 2026. Não foram determinadas alíquotas ou isenções. Integração fiscal não foi acrescentada ao MVP; obrigações da escola continuam existindo fora do sistema.

## Licença e próximos documentos

A [AGPL 3.0](licensing.md) rege a utilização do software; não autoriza publicar dados escolares nem substitui conformidade educacional, consumerista ou de privacidade.

Próxima revisão recomendada: conferir contrato e lista reais contra as correções já incorporadas; validar composição dos valores e restituições; conferir atos da escola e regras locais; detalhar dados, representação legal e privacidade. Não publicar anexos preenchidos nem dados de alunos no GitHub.

Acompanhar evidências e pendências na [matriz de conformidade](conformidade.md). Esta documentação não comprova controles existentes ou validados em operação.
