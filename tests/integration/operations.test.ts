import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execFileSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';

let container: StartedPostgreSqlContainer; let app: { close(): Promise<void>; listen(port: number, host: string): Promise<unknown>; getUrl(): Promise<string>; get<T>(token: new (...args: never[]) => T): T }; let base = ''; let secretaryToken = ''; let directorToken = ''; let db: import('@smartschool/database').Database; let studentId = '';
async function call(path: string, method = 'GET', body?: unknown, token = secretaryToken) { return fetch(base + '/api/v1/operations' + path, { method, headers: { 'Content-Type': 'application/json', 'x-smartschool-client': 'web', Authorization: 'Bearer ' + token }, body: body === undefined ? undefined : JSON.stringify(body) }); }
beforeAll(async () => { container = await new PostgreSqlContainer('postgres:17.9-bookworm').start(); Object.assign(process.env, { DATABASE_URL: container.getConnectionUri(), AUTH_JWT_SECRET: randomBytes(48).toString('hex'), AUTH_COOKIE_SECURE: 'false', S3_ENDPOINT: 'http://localhost:59000', S3_REGION: 'us-east-1', S3_BUCKET: 'test-bucket', S3_ACCESS_KEY: 'test', S3_SECRET_KEY: 'fictitious-test-secret', WEB_ORIGIN: 'http://localhost:5173', LOG_LEVEL: 'silent' }); execFileSync('pnpm', ['db:migrate'], { env: process.env, stdio: 'pipe' }); const requireApi = createRequire(new URL('../../apps/api/package.json', import.meta.url)); const { NestFactory } = requireApi('@nestjs/core'); const { AppModule } = await import('../../apps/api/dist/app.module.js'); const { AccessService } = await import('../../apps/api/dist/access/access.service.js'); app = await NestFactory.create(AppModule, { logger: false }); await app.listen(0, '127.0.0.1'); const access = app.get(AccessService); db = access.db; const directorPassword = randomBytes(24).toString('hex'); const director = await access.createUser({ name: 'Diretor Operações Fictício', email: 'operations-director@example.test', password: directorPassword, role: 'DIRECTOR' }, null); const secretaryPassword = randomBytes(24).toString('hex'); const secretary = await access.createUser({ name: 'Secretaria Operações Fictícia', email: 'operations-secretary@example.test', password: secretaryPassword, role: 'SECRETARY' }, director.id); directorToken = (await access.login(director.email, directorPassword)).accessToken; secretaryToken = (await access.login(secretary.email, secretaryPassword)).accessToken; const person = await db.person.create({ data: { name: 'Aluno Operações Fictício' } }); const student = await db.studentProfile.create({ data: { personId: person.id } }); studentId = student.id; base = await app.getUrl(); });
afterAll(async () => { await app?.close(); await container?.stop(); });

describe('MD-11 a MD-15 — operações', () => {
  it('permite transição para secretaria, preserva idempotência e restringe relatório à Direção', async () => {
    const operationKey = randomUUID(); const payload = { operationKey, studentId, fromEnrollmentId: null, targetSchoolYearId: null, kind: 'TRANSFER', destination: 'Escola fictícia', acknowledgementAt: null, documentsReleased: true, financialReview: 'Acordo em análise; fluxo não bloqueado' };
    const transition = await call('/transitions', 'POST', payload); expect(transition.status, await transition.clone().text()).toBe(201); expect((await transition.json()).documentsReleased).toBe(true);
    expect((await call('/transitions', 'POST', payload)).status).toBe(409);
    expect((await call('/reports', 'POST', { from: null, to: null, contractId: null })).status).toBe(403);
    const report = await call('/reports', 'POST', { from: null, to: null, contractId: null }, directorToken); expect(report.status, await report.clone().text()).toBe(201); expect((await report.json()).receipts.count).toBe(0);
    expect((await call('/readiness', 'GET', undefined, directorToken)).status).toBe(200);
  });
});
