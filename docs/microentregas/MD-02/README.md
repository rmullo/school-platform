# MD-02 — Acesso e auditoria básica

Estado: **Aprovada**, com aceite explícito do usuário em 21/10/2026. Implementação e verificações na [TASK-0005](../../tasks/TASK-0005-md02-acesso-e-auditoria.md). A MD-03 foi autorizada para planejamento; sua implementação ainda não iniciou.

## Escopo

Contas individuais, autenticação por e-mail/senha, sessões renováveis, encerramento e revogação de acessos. Autorizações verificadas na API. Auditoria das alterações de contas persistida na mesma transação. Não inclui cadastros escolares, dados reais, implantação ou certificação operacional.

## Matriz inicial

| Operação | DIRECTOR | SECRETARY | IT |
| --- | --- | --- | --- |
| Entrar, consultar identidade e encerrar sessão própria | Sim | Sim | Sim |
| Administrar contas, perfis e revogar sessões | Sim | Não | Não |
| Consultar auditoria de contas | Sim | Não | Não |
| Consultar painel técnico protegido | Sim | Não | Sim |

TI não recebe acesso administrativo a pessoas ou auditoria escolar por padrão. Secretaria ainda não dispõe de operações escolares: elas dependem de outras microentregas. A concessão de cada operação futura exige autorização própria na API.

## Preparação

Usar somente dados fictícios. Executar `node scripts/setup.mjs` antes de iniciar os serviços. O script acrescenta as variáveis da MD-02 a configurações antigas, preservando as credenciais existentes. `AUTH_JWT_SECRET` é gerado aleatoriamente; nunca compartilhar ou versionar o arquivo local. `AUTH_COOKIE_SECURE=false` destina-se exclusivamente ao HTTP local; HTTPS deve usar cookie seguro.

Após `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm db:migrate` e `pnpm infra:init`, iniciar a API/interface conforme o guia da MD-01. Criar o primeiro Diretor em terminal interativo:

```sh
node --env-file=.env apps/api/dist/access/bootstrap.js
```

Na pilha Docker completa, usar `docker compose exec -it api node apps/api/dist/access/bootstrap.js`. O comando pede nome, e-mail e senha oculta (12 a 128 caracteres), permite bootstrap somente enquanto não houver contas e registra auditoria. Nunca passar a senha como argumento ou publicar credenciais. Não há senha padrão ou contas escolares criadas automaticamente.

Abrir http://localhost:5173. Diretor acessa **Contas e auditoria**, cadastra pessoas e gerencia perfil, situação ou revogação mediante motivo. O último Diretor ativo é protegido inclusive contra alterações concorrentes. Qualquer alteração de perfil/situação revoga as sessões anteriores. Para demonstração, criar nomes e endereços `@example.test` fictícios.

## Sessões e API

- Senhas: Argon2id, 64 MiB, três iterações e paralelismo 1. Credenciais inválidas recebem mensagem genérica; login limitado a dez tentativas por minuto por endereço observado pela API.
- JWT HS256: validade de dez minutos, emissor/audiência verificados; identidade, situação e sessão também conferidas no PostgreSQL a cada acesso protegido.
- Refresh aleatório de 48 bytes: somente hash SHA-256 no banco, rotação a cada uso e prazo absoluto de sete dias. O uso repetido de um refresh antigo revoga a família de sessões. A rotação não prolonga o prazo absoluto; JWT anterior permanece válido até expirar, salvo revogação da família/conta.
- Navegador: refresh em cookie HttpOnly, SameSite Strict, caminho `/api/v1/auth`; JWT somente em memória, sem localStorage. Renovação concorrente na mesma aba é compartilhada; Web Locks serializa renovações entre abas quando disponível.
- Escritas exigem `x-smartschool-client: web` e rejeitam `Origin` diferente de `WEB_ORIGIN`. CORS restrito permite credenciais. O transporte de refresh para aplicativo nativo não foi implementado nesta etapa; não armazenar tokens em armazenamento inseguro.
- `/health` e `/ready` permanecem públicos para diagnóstico; `/ready` não expõe identificador da instalação. `/api/v1/status` exige Diretor ou TI. Swagger em `/api/docs`.

| Método e rota, prefixo `/api/v1` | Entrada e acesso |
| --- | --- |
| POST `auth/login` | `{email,password}`; responde `{accessToken,user}` e cookie |
| POST `auth/refresh` | Cookie e cabeçalho do cliente; responde nova sessão |
| GET `auth/me` | Bearer; responde identidade pública |
| POST `auth/logout` | Bearer e cabeçalho do cliente; revoga a família e remove cookie |
| GET / POST `users` | Diretor; criação `{name,email,password,role}` |
| PATCH `users/:id` | Diretor; `{role?,active?,reason}` |
| POST `users/:id/revoke` | Diretor; `{reason}` |
| GET `audit` | Diretor; eventos de acesso e alterações |

Listagens limitadas aos 100 registros mais recentes, sem paginação nesta etapa. Auditoria contém responsável, ação, conta afetada, motivo e instante UTC; não inclui hash de senha ou refresh. Alterações de contas, revogações e auditoria usam transação PostgreSQL. Não há interface de edição/exclusão de auditoria.

## Verificações e limites

Com os pacotes compilados: `pnpm typecheck`, `pnpm test`, `pnpm test:integration`, `pnpm smoke` e `pnpm test:e2e`. Integração usa PostgreSQL descartável com Testcontainers. E2E exige API/interface iniciadas e banco local fictício; cria contas temporárias com identificadores próprios e remove apenas seus registros no encerramento. Não executar esses testes em banco com dados reais. Smoke verifica proteção anônima, prontidão e arquivo privado; jornadas autenticadas são verificadas por integração/E2E.

O limitador de login é local ao processo e, atrás do proxy Compose, considera o endereço do proxy: usuários compartilham esse limite. Distribuição entre instâncias, recuperação/troca de senha, MFA, gestão de dispositivos, política operacional de retenção e auditoria de futuros módulos não estão implementadas. Configuração de produção/HTTPS e autorização para dados reais continuam posteriores. Nenhum teste local equivale a CI executada ou certificação operacional.

## Roteiro de validação

1. Criar o primeiro Diretor com dados fictícios pelo procedimento de bootstrap a documentar.
2. Entrar com senha incorreta: mensagem compreensível sem exposição de existência de conta.
3. Entrar com Diretor, criar Secretaria e TI; conferir a auditoria sem senhas/tokens.
4. Entrar com cada perfil e tentar ações não autorizadas diretamente na API: retornar bloqueio, não apenas ocultar botões.
5. Desativar e revogar uma conta com sessão aberta: acesso e renovação devem parar de funcionar.
6. Sair e tentar reutilizar a sessão: acesso deve ser recusado.
7. Conferir largura móvel, teclado, foco, mensagens e recuperação após erro.

Aceite do usuário pendente. Verificações reais e limitações ficam na tarefa.

[Voltar ao roadmap](../../roadmap.md).
