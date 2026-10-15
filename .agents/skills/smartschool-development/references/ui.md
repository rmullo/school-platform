# UI do SmartSchool

Ler quando a tarefa alterar a interface. A referência é o fluxo escolar aprovado, não um novo desenho de produto. A fundação atual está em apps/web/src/main.tsx e no tema MUI ali definido.

## Estrutura e consistência

- Preservar idioma português, hierarquia de títulos e vocabulário usado pela escola. Mensagens ao usuário devem explicar a ação ou recuperação, sem expor stack traces, endpoints ou códigos internos desnecessários.
- Usar componentes MUI e o tema para tipografia, cores, espaçamento e estados. Centralizar tokens quando houver reutilização concreta; não criar uma segunda biblioteca de componentes.
- Extrair telas, componentes e hooks por responsabilidade à medida que cresçam. O arquivo único da MD-01 é um ponto de partida, não padrão para todas as funcionalidades.
- Usar React Router para navegação e TanStack Query para estado remoto. Não manter uma segunda cópia de dados remotos em estado local sem necessidade. A chave de consulta deve incluir os filtros que alteram a resposta.
- Quando surgir formulário, usar a escolha aprovada de React Hook Form + Zod e configurar/testar suas dependências nessa entrega. Eles ainda não estão ambos instalados: Zod já está nos contratos/API; React Hook Form não está no frontend.

## Estados e ações

Definir somente os estados aplicáveis ao fluxo: carregando, vazio, preenchido, erro, atualização e envio. Um resultado anterior não pode continuar parecendo atual e saudável após erro de atualização, como já verificado no painel da MD-01.

- Identificar a ação principal; indicar progresso durante envio e impedir repetição involuntária. A proteção da interface não substitui idempotência e consistência da API.
- Preservar entradas válidas quando houver erro recuperável. Informar o campo e a correção esperada; posicionar foco no erro ou em resumo acessível.
- Confirmar ações destrutivas ou financeiras com consequências concretas e resumo do que será afetado; não pedir confirmação para toda ação rotineira.
- Apresentar moeda, datas, descontos, total e vencimento de forma coerente com a regra aprovada. Cálculos na tela são apresentação; o servidor determina o resultado.
- Não transformar dados opcionais, compras ou preferências em barreiras de matrícula sem fundamento na especificação.

## Acessibilidade e revisão visual

- Usar elementos semânticos e nomes acessíveis: botão para ação, link para navegação, label associado a campo. Não depender apenas de placeholder, cor ou ícone.
- Verificar contraste legível, foco visível, ordem de tabulação e acionamento por teclado. Dialogs devem receber foco e devolvê-lo ao controle de origem ao fechar.
- Comunicar mudanças relevantes sem interromper continuamente a leitura; usar anúncios acessíveis adequados ao contexto.
- Conferir a tela em largura desktop e móvel, zoom e texto longo. Evitar corte horizontal; tabelas extensas precisam de alternativa de navegação compreensível.
- Inspecionar captura ou navegador após mudança significativa de layout e conferir console/erros da jornada. Registrar viewport, cenário e resultado na tarefa; não chamar captura de teste automatizado de acessibilidade.

Em testes de UI, localizar controles por papel e nome acessível. Usar identificador de teste apenas quando não houver uma referência semântica estável, evitando seletores dependentes da estrutura interna do MUI.
