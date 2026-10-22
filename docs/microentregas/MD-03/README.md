# MD-03 — Estrutura escolar

Estado: **Planejada**, autorizada pelo usuário em 21/10/2026 após o aceite da MD-02. A execução será registrada na [TASK-0006](../../tasks/TASK-0006-md03-estrutura-escolar.md). MD-04 não iniciada.

## Escopo

Ano letivo, etapa, série, turma, capacidade máxima e referência administrativa à autorização da etapa. O cadastro e a consulta devem preservar relacionamentos, validar capacidade e separar estrutura registrada de oferta ativada.

## Regras desta etapa

- A etapa registra órgão, ato, validade e evidência da autorização como referência administrativa.
- Atos e órgãos dos testes são fictícios e não representam autorização real.
- Não ativar oferta sem referência de autorização válida para o cenário demonstrado.
- Não reduzir capacidade abaixo da ocupação existente.
- Não inventar critérios etários, exceções ou limites normativos ausentes dos documentos vigentes.
- Diretor administra a estrutura; Secretaria e TI não recebem operações além da matriz autorizada.
- Alunos, responsáveis, matrículas, campanhas, contratos e dados reais ficam fora da MD-03.

## Demonstração prevista

1. Criar ano letivo, etapa, série e turma com dados fictícios.
2. Associar uma referência de autorização fictícia e ativar a oferta.
3. Consultar a estrutura e a capacidade.
4. Tentar salvar campos inválidos e reduzir a capacidade abaixo da ocupação.
5. Confirmar bloqueios de perfil na API e a auditoria das alterações.

## Dependências e limitações

MD-02 está aprovada. A capacidade ocupada será preparada com uma fixture técnica ou somente com registros da própria tarefa; não criar matrícula escolar antecipadamente. A validade jurídica dos atos, critérios etários, escrituração e autorização real permanecem pendentes de evidência operacional.

[Voltar ao roadmap](../../roadmap.md).
