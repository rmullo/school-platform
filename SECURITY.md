# Segurança

> Requisitos de segurança e privacidade revisados em 07/10/2026. Procedimentos, pessoas e canais reais ainda precisam ser definidos; nenhum controle operacional foi auditado.

## Comunicação de vulnerabilidades

_A definir: canal privado e pessoas responsáveis. Nenhum e-mail ou prazo de resposta foi estabelecido._

## Tratamento de um relato

Registrar o relato de forma privada, identificar responsável por triagem, preservar evidências necessárias e avaliar se houve incidente com dados pessoais. Conter, corrigir, analisar risco/dano e documentar as decisões. Vulnerabilidade sem exposição conhecida e incidente com dados pessoais são situações distintas.

Para incidentes sujeitos à comunicação, a regra geral é de três dias úteis à ANPD e aos titulares, contados do conhecimento pelo controlador de que o incidente afetou dados pessoais; verificar hipóteses específicas aplicáveis. O operador deve informar o controlador sem demora injustificada. Não esperar investigação completa para iniciar a avaliação do prazo. Manter registro dos incidentes por pelo menos cinco anos, com acesso restrito. Fontes e condições: [ANPD, comunicação de incidentes](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis?sck=direto) e [Resolução nº 15/2024, explicação oficial](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca).

## Acesso e proteção

Contas individuais e menor privilégio. TI não acessa documentos pessoais irrestritamente por padrão; acesso excepcional tem justificativa, limite e auditoria. Restringir anexos e dados de saúde/representação, revogar acesso após desligamento e verificar restauração de backups. Dados reais não entram em testes, exemplos, logs desnecessários ou repositórios. Planejar interface acessível.

## Governança de dados

Antes de usar dados reais, documentar inventário, finalidades, bases legais, aviso de privacidade, retenção por categoria, responsabilidades da escola/fornecedores e canal de direitos. Verificar identidade e representação ao atender pedidos; justificar retenções legalmente necessárias. Não presumir dispensa de encarregado ou regime simplificado sem avaliar o enquadramento.

Aplicar retenção também à auditoria, logs e cópias de segurança. Se mensageria for introduzida futuramente, reavaliar retenção e acesso para os novos componentes conforme a [decisão 0002](docs/decisions/0002-mvp-sem-kafka.md). Definir como a restauração preservará exclusões/restrições válidas. Avaliar contratos, suboperadores e transferências internacionais antes de hospedagem externa. Fundamentos e pendências: [LEG-08 a LEG-10](docs/compliance.md).

## Informações usadas na documentação

Usar exemplos fictícios e não incluir senhas, comprovantes ou dados pessoais de alunos e responsáveis nos modelos públicos de discussão.

## Referências

Requisitos de segurança já registrados: [SPECIFICATION.md](docs/SPECIFICATION.md#acesso-segurança-e-auditoria). Levantamento legal inicial, incluindo privacidade e incidentes: [compliance.md](docs/compliance.md). A política operacional permanece pendente.
