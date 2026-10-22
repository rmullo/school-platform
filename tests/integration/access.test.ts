import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';

let container: StartedPostgreSqlContainer;
let app: { close(): Promise<void>; useGlobalFilters(filter: unknown): void; listen(port: number, host: string): Promise<unknown>; getUrl(): Promise<string>; get<T>(token: new (...args: never[]) => T): T };
let base = '';
let service: import('../../apps/api/src/access/access.service.js').AccessService;
const password = randomBytes(24).toString('hex');
const initialEnv = { ...process.env };
const headers = { 'Content-Type': 'application/json', 'x-smartschool-client': 'web' };
async function call(path: string, method = 'GET', body?: unknown, token?: string, cookie?: string) {
  return fetch(base + '/api/v1/' + path, { method, headers: { ...headers, ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(cookie ? { Cookie: cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
}
async function login(email = 'director@example.test') {
  const response = await call('auth/login', 'POST', { email, password });
  expect(response.status).toBe(200);
  return { ...await response.json(), cookie: response.headers.get('set-cookie')!.split(';')[0]! } as { accessToken: string; user: { id: string }; cookie: string };
}

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:17.9-bookworm').start();
  Object.assign(process.env, { DATABASE_URL: container.getConnectionUri(), AUTH_JWT_SECRET: randomBytes(48).toString('hex'), AUTH_COOKIE_SECURE: 'false', S3_ENDPOINT: 'http://localhost:59000', S3_REGION: 'us-east-1', S3_BUCKET: 'test-bucket', S3_ACCESS_KEY: 'test', S3_SECRET_KEY: 'fictitious-test-secret', WEB_ORIGIN: 'http://localhost:5173', LOG_LEVEL: 'silent' });
  execFileSync('pnpm', ['db:migrate'], { env: process.env, stdio: 'pipe' });
  const requireApi = createRequire(new URL('../../apps/api/package.json', import.meta.url));
  const { NestFactory } = requireApi('@nestjs/core');
  // Compiled Nest classes preserve DI metadata; Vitest's TS transformer does not.
  const { AppModule } = await import('../../apps/api/dist/app.module.js');
  const { AccessService } = await import('../../apps/api/dist/access/access.service.js');
  const { ProblemFilter } = await import('../../apps/api/dist/problem.filter.js');
  app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalFilters(new ProblemFilter());
  await app.listen(0, '127.0.0.1'); base = await app.getUrl();
  service = app.get(AccessService);
  await service.createUser({ name: 'Diretor Fictício', email: 'director@example.test', password, role: 'DIRECTOR' }, null);
}, 90000);
afterAll(async () => { await app?.close(); await container?.stop(); process.env = initialEnv; });

describe('Acesso com API e PostgreSQL reais', () => {
  it('bootstrap único, credencial inválida e senha protegida', async () => {
    await expect(service.createUser({ name: 'Outro Diretor', email: 'other@example.test', password, role: 'DIRECTOR' }, null)).rejects.toThrow();
    expect((await call('auth/login', 'POST', { email: 'director@example.test', password: 'incorrect' })).status).toBe(401);
    const user = await service.db.user.findUniqueOrThrow({ where: { email: 'director@example.test' } });
    expect(user.passwordHash).toMatch(/^\$argon2id\$/); expect(user.passwordHash).not.toContain(password);
  });
  it('nega anônimo, origem indevida e menor privilégio para Secretaria/TI', async () => {
    expect((await call('users')).status).toBe(401);
    const director = await login();
    for (const role of ['SECRETARY', 'IT']) {
      const email = role.toLowerCase() + '@example.test';
      const response = await call('users', 'POST', { name: 'Pessoa Fictícia', email, password, role }, director.accessToken);
      expect(response.status).toBe(201); expect(await response.text()).not.toContain('passwordHash');
      const session = await login(email);
      expect((await call('users', 'GET', undefined, session.accessToken)).status).toBe(403);
      expect((await call('audit', 'GET', undefined, session.accessToken)).status).toBe(403);
      expect((await call('auth/me', 'GET', undefined, session.accessToken)).status).toBe(200);
    }
    const origin = await fetch(base + '/api/v1/auth/refresh', { method: 'POST', headers: { ...headers, Origin: 'https://untrusted.example', Cookie: director.cookie } });
    expect(origin.status).toBe(403);
  });
  it('rotaciona refresh e replay revoga a família inclusive o token novo', async () => {
    const initial = await login();
    const response = await call('auth/refresh', 'POST', {}, undefined, initial.cookie);
    expect(response.status).toBe(200);
    const next = await response.json();
    expect((await call('auth/me', 'GET', undefined, initial.accessToken)).status).toBe(200);
    expect((await call('auth/refresh', 'POST', {}, undefined, initial.cookie)).status).toBe(401);
    expect((await call('auth/me', 'GET', undefined, next.accessToken)).status).toBe(401);
  });
  it('desativa conta e revoga acesso e refresh imediatamente com auditoria', async () => {
    const director = await login(); const secretary = await login('secretary@example.test');
    const result = await call('users/' + secretary.user.id, 'PATCH', { active: false, reason: 'Desligamento fictício' }, director.accessToken);
    expect(result.status).toBe(200);
    expect((await call('auth/me', 'GET', undefined, secretary.accessToken)).status).toBe(401);
    expect((await call('auth/refresh', 'POST', {}, undefined, secretary.cookie)).status).toBe(401);
    const audit = await service.db.auditEvent.findFirstOrThrow({ where: { targetId: secretary.user.id, action: 'USER_UPDATED' } });
    expect(audit.actorId).toBe(director.user.id); expect(audit.reason).toBe('Desligamento fictício');
  });
  it('preserva último Diretor e reverte alteração sem auditoria parcial', async () => {
    const director = await login();
    const before = await service.db.auditEvent.count({ where: { action: 'USER_UPDATED' } });
    expect((await call('users/' + director.user.id, 'PATCH', { active: false, reason: 'Teste de proteção' }, director.accessToken)).status).toBe(409);
    expect(await service.db.auditEvent.count({ where: { action: 'USER_UPDATED' } })).toBe(before);
    expect((await service.db.user.findUniqueOrThrow({ where: { id: director.user.id } })).active).toBe(true);
  });
  it('logout invalida tokens e armazena apenas hash do refresh', async () => {
    const session = await login('it@example.test');
    const rows = await service.db.session.findMany({ where: { userId: session.user.id } });
    expect(rows.every(row => /^[a-f0-9]{64}$/.test(row.refreshHash))).toBe(true);
    expect((await call('auth/logout', 'POST', {}, session.accessToken, session.cookie)).status).toBe(204);
    expect((await call('auth/me', 'GET', undefined, session.accessToken)).status).toBe(401);
    expect((await call('auth/refresh', 'POST', {}, undefined, session.cookie)).status).toBe(401);
  });
  it('sessão expirada e JWT expirado não autorizam acesso', async () => {
    const session = await login('it@example.test');
    const requireApi = createRequire(new URL('../../apps/api/package.json', import.meta.url));
    const { SignJWT } = requireApi('jose');
    const expired = await new SignJWT({ sid: session.user.id }).setProtectedHeader({ alg: 'HS256' }).setSubject(session.user.id).setIssuer('smartschool').setAudience('smartschool-clients').setExpirationTime(Math.floor(Date.now() / 1000) - 1).sign(new TextEncoder().encode(process.env.AUTH_JWT_SECRET));
    expect((await call('auth/me', 'GET', undefined, expired)).status).toBe(401);
    await service.db.session.updateMany({ where: { userId: session.user.id }, data: { expiresAt: new Date(0) } });
    expect((await call('auth/me', 'GET', undefined, session.accessToken)).status).toBe(401);
    expect((await call('auth/refresh', 'POST', {}, undefined, session.cookie)).status).toBe(401);
  });
  it('duas alterações concorrentes não eliminam o último Diretor', async () => {
    const first = await service.db.user.findUniqueOrThrow({ where: { email: 'director@example.test' } });
    const second = await service.createUser({ name: 'Segundo Diretor', email: 'second@example.test', password, role: 'DIRECTOR' }, first.id);
    const results = await Promise.allSettled([
      service.changeUser(first.id, first.id, { active: false, reason: 'Disputa fictícia um' }),
      service.changeUser(second.id, second.id, { active: false, reason: 'Disputa fictícia dois' }),
    ]);
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(await service.db.user.count({ where: { role: 'DIRECTOR', active: true } })).toBe(1);
  });
  it('limita tentativas de login e informa tempo para recuperação', async () => {
    const result = await call('auth/login', 'POST', { email: 'unknown@example.test', password: 'invalid' });
    expect(result.status).toBe(429); expect(result.headers.get('retry-after')).toBe('60');
  });
});
