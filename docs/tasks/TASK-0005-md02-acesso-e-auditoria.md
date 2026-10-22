# TASK-0005 — MD-02: acesso e auditoria básica

- Estado: Concluída.
- Criação: 21/10/2026.
- Origem: usuário solicitou executar a MD-02.
- Dependência: MD-01 aceita. Requisitos: RF-09 e RF-12; seção de acesso da especificação.

## Escopo e aceite

Implementar contas individuais com DIRECTOR, SECRETARY e IT; e-mail/senha com Argon2id, JWT curto, refresh rotativo, logout e revogação; autorização no servidor e auditoria transacional de alterações de contas. Interface acessível para login, sessão, administração autorizada e consulta de auditoria. Não implementar regras escolares, MD-03, publicação ou dados reais.

- [x] Login válido/inválido, expiração, rotação, revogação e logout verificados.
- [x] Perfis e conta desativada impedidos pela API conforme matriz documentada.
- [x] Alterações e auditoria persistidas atomicamente, sem senhas/tokens nos registros.
- [x] Tela com estados de envio, erro, vazio e recuperação; revisão móvel/teclado.
- [x] Build, tipos e testes proporcionais executados; limitações reais registradas.
- [x] Documentação e roteiro manual atualizados.
- [ ] Aceite explícito do usuário (pendente).

## Verificações iniciais

Sandbox não executa Node/pnpm; Git solicita ferramentas de desenvolvimento. Verificação autorizada fora do sandbox encontrou Node 24.22.1 e Docker; pnpm não está no PATH. Estado Git sem alterações antes da criação desta tarefa.

## Trabalho realizado

- API: módulo de acesso separado de transporte/serviço; contas e perfis, Argon2id, JWT, refresh rotativo com detecção de replay, logout, desativação e revogação imediata. Bootstrap interativo sem senha padrão e sem senha em argumentos.
- Banco: migração adicional, sem alterar a migração da MD-01; contas, sessões com hash do refresh e eventos de auditoria. Lock transacional serializa alterações de acesso e protege o último Diretor ativo.
- Interface: login, recuperação de sessão, navegação por perfil, criação/alteração de contas com motivo, consulta de auditoria e painel técnico protegido. React Hook Form/Zod instalados; páginas separadas e carregamento por rota, eliminando o aviso anterior de chunk acima de 500 kB no build atual.
- Configuração: segredo aleatório, cookie local configurável, Compose/Dev Container e lockfile atualizados; setup preserva credenciais anteriores. Smoke ajustado para endpoints protegidos.
- Documentação: guia da MD-02, índices, roadmap, especificação, cadastros, módulos, instruções e apresentação atualizados. A skill orientou separação de responsabilidades, estados recuperáveis, inspeção visual e testes por risco.

## Verificações reais — 21/10/2026

| Comando/cenário | Resultado |
| --- | --- |
| `pnpm build` | Cinco pacotes compilados; páginas divididas em chunks menores que 500 kB |
| `pnpm typecheck` | Aprovado em todos os pacotes |
| `pnpm test` | 7 testes unitários aprovados |
| `pnpm test:integration` | 11 testes aprovados em PostgreSQL descartável: migrações, rollback, autenticação, perfis, desativação, expiração de JWT/sessão, rotação/replay, logout, proteção concorrente do último Diretor e limite de tentativas |
| `pnpm smoke` | Aprovado: saúde, prontidão, proxy protegido, Swagger, correlationId e arquivo privado |
| `pnpm test:e2e` | 9 aprovados: login inválido/recuperação, Diretor, Secretaria, criação/desativação, logout/recarregamento, painel técnico/falhas/recuperação e largura móvel |
| Capturas e teclado | Login inspecionado em 1440×1000 e 390×844, sem corte; tabulação entre e-mail/senha/botão verificada. Capturas locais ignoradas pelo Git |
| Diagnósticos do editor | Nenhum erro informado |
| `docker compose build api web init` / `docker compose up -d --wait` | Imagens compiladas, migrações/inicialização concluídas e quatro serviços saudáveis |
| Limpeza E2E | Confirmadas zero contas locais após a execução; nenhum cadastro permanente de demonstração criado |
| Pilha Docker final | Smoke e dois E2E focados (sessão/logout e criação/desativação) aprovados também via Nginx/API em containers |
| Documentação/diff | 128 links locais conferidos; `git diff --check` sem erros |

Primeiras rodadas encontraram problemas de ambiente (pnpm fora do PATH, política nativa do Argon2), tipos Prisma e Web Locks; corrigidos antes das verificações finais. Houve falhas/uma interrupção de E2E durante alterações de código; essas execuções não são usadas como aprovação. A rodada estável final aprovou os nove casos sem retries. Nenhuma execução de CI no GitHub foi presumida.

## Roteiro do usuário e limitações

Seguir o [guia da MD-02](../microentregas/MD-02/README.md): criar o primeiro Diretor por terminal interativo, entrar, cadastrar Secretaria/TI, conferir bloqueios, alterar/desativar/revogar e consultar auditoria. Somente dados fictícios. Não existe senha padrão ou aprovação presumida.

Listagens limitadas a 100 registros; limitador de login por processo/IP (compartilhado atrás do proxy local). Recuperação/troca de senha, MFA, transporte de refresh para app nativo, retenção operacional e controles dos módulos escolares não implementados. Dev Container recebeu as variáveis necessárias, mas não foi reaberto nesta tarefa. Não houve teste com dados reais, implantação ou certificação de produção.

## Feedback e aceite

- 21/10/2026: usuário aprovou a MD-02 e solicitou avançar para a MD-03.
- Aceite explícito registrado nesta mensagem; a tarefa foi encerrada sem ampliar o escopo da MD-02.

- 21/10/2026: usuário solicitou criar um Diretor de teste no desenvolvimento. Escopo adicional: uma conta fictícia local, senha aleatória não versionada, verificação de login/perfil e encerramento da sessão de verificação. Não alterar contas existentes ou criar dados reais; MD-02 continua em validação.
- Executado: primeiro Diretor fictício criado pelo serviço de acesso com auditoria de bootstrap. Login via interface/proxy retornou 200, perfil DIRECTOR confirmado, consulta de identidade retornou 200 e logout de verificação retornou 204. A conta permanece ativa para teste do usuário; senha entregue apenas na conversa, sem registro em arquivos. Não houve alteração de código, commit ou publicação.

- 21/10/2026: usuário solicitou executar a MD-02; implementação autorizada.
- Entrega aprovada pelo usuário em 21/10/2026.
- Nenhum commit, push ou publicação realizado nesta tarefa.
