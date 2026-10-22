import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';

let container: StartedPostgreSqlContainer; let app: { close(): Promise<void>; useGlobalFilters(filter: unknown): void; listen(port: number, host: string): Promise<unknown>; getUrl(): Promise<string>; get<T>(token: new (...args: never[]) => T): T }; let base = ''; let director = ''; let secretary = ''; let itToken = ''; let db: import('@smartschool/database').Database;
const initialEnv = { ...process.env };
async function call(path: string, method = 'GET', body?: unknown, token = director) { return fetch(base + '/api/v1/people' + path, { method, headers: { 'Content-Type': 'application/json', 'x-smartschool-client': 'web', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) }); }
beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:17.9-bookworm').start(); Object.assign(process.env, { DATABASE_URL: container.getConnectionUri(), AUTH_JWT_SECRET: randomBytes(48).toString('hex'), AUTH_COOKIE_SECURE: 'false', S3_ENDPOINT: 'http://localhost:59000', S3_REGION: 'us-east-1', S3_BUCKET: 'test-bucket', S3_ACCESS_KEY: 'test', S3_SECRET_KEY: 'fictitious-test-secret', WEB_ORIGIN: 'http://localhost:5173', LOG_LEVEL: 'silent' }); execFileSync('pnpm', ['db:migrate'], { env: process.env, stdio: 'pipe' });
  const requireApi = createRequire(new URL('../../apps/api/package.json', import.meta.url)); const { NestFactory } = requireApi('@nestjs/core'); const { AppModule } = await import('../../apps/api/dist/app.module.js'); const { AccessService } = await import('../../apps/api/dist/access/access.service.js'); const { ProblemFilter } = await import('../../apps/api/dist/problem.filter.js'); app = await NestFactory.create(AppModule, { logger: false }); app.useGlobalFilters(new ProblemFilter()); await app.listen(0, '127.0.0.1'); base = await app.getUrl(); const access = app.get(AccessService); db = access.db;
  const password = randomBytes(24).toString('hex'); const actor = await access.createUser({ name: 'Diretor Fictício', email: 'people-director@example.test', password, role: 'DIRECTOR' }, null); director = (await access.login(actor.email, password)).accessToken;
  const secretaryPassword = randomBytes(24).toString('hex'); const secretaryUser = await access.createUser({ name: 'Secretaria Fictícia', email: 'people-secretary@example.test', password: secretaryPassword, role: 'SECRETARY' }, actor.id); secretary = (await access.login(secretaryUser.email, secretaryPassword)).accessToken;
  const itPassword = randomBytes(24).toString('hex'); const itUser = await access.createUser({ name: 'TI Fictícia', email: 'people-it@example.test', password: itPassword, role: 'IT' }, actor.id); itToken = (await access.login(itUser.email, itPassword)).accessToken;
}, 90000);
afterAll(async () => { await app?.close(); await container?.stop(); process.env = initialEnv; });

describe('Pessoas e vínculos com PostgreSQL e API reais', () => {
  it('permite Secretaria e bloqueia TI e anônimo', async () => {
    expect((await call('', 'GET', undefined, '')).status).toBe(401); expect((await call('', 'GET', undefined, itToken)).status).toBe(403); const response = await call('', 'GET', undefined, secretary); expect(response.status, await response.clone().text()).toBe(200);
  });
  it('separa pessoa, aluno, filiação, representação e retirada', async () => {
    const create = async (body: unknown) => { const response = await call('', 'POST', body, secretary); expect(response.status).toBe(201); return response.json() as Promise<{ id: string; version: number }>; };
    const studentPerson = await create({ name: 'Aluno Fictício', email: null, phone: null, birthDate: '2015-03-04' }); const parent = await create({ name: 'Mãe Fictícia', email: 'mae@example.test', phone: '88999990000', birthDate: null }); const guardian = await create({ name: 'Guardião Fictício', email: null, phone: null, birthDate: null });
    const studentResponse = await call('/students', 'POST', { personId: studentPerson.id }, secretary); expect(studentResponse.status).toBe(201); const student = await studentResponse.json() as { id: string };
    expect((await call(`/students/${student.id}/parentage`, 'POST', { personId: parent.id, role: 'MOTHER', evidence: 'Referência fictícia de filiação', validFrom: '2020-01-01', validUntil: '2099-12-31' }, secretary)).status).toBe(201);
    expect((await call(`/students/${student.id}/representation`, 'POST', { personId: guardian.id, kind: 'LEGAL_GUARDIAN', evidence: 'Referência fictícia de guarda', restrictions: 'Somente demonstração', validFrom: '2024-01-01', validUntil: '2099-12-31' }, secretary)).status).toBe(201);
    expect((await call(`/students/${student.id}/pickup`, 'POST', { personId: guardian.id, evidence: 'Autorização fictícia de retirada', restrictions: null, validFrom: '2024-01-01', validUntil: '2024-12-31' }, secretary)).status).toBe(201);
    const overviewResponse = await call('', 'GET', undefined, secretary); expect(overviewResponse.status, await overviewResponse.clone().text()).toBe(200); const overview = await overviewResponse.json(); expect(overview.students[0].parentage[0].role).toBe('MOTHER'); expect(overview.students[0].representations[0].kind).toBe('LEGAL_GUARDIAN'); expect(overview.students[0].pickup[0].personId).toBe(guardian.id);
  });
  it('mantém um responsável financeiro e não cria representação automaticamente', async () => {
    const people = await db.person.createManyAndReturn({ data: [{ name: 'Aluno Financeiro', email: null, phone: null, birthDate: null }, { name: 'Pagador Fictício', email: null, phone: null, birthDate: null }] }); const student = await db.studentProfile.create({ data: { personId: people[0].id } });
    const body = { personId: people[1].id, evidence: 'Indicação financeira fictícia' }; expect((await call(`/students/${student.id}/financial`, 'POST', body)).status).toBe(201); expect((await call(`/students/${student.id}/financial`, 'POST', body)).status).toBe(409);
    const overviewResponse = await call('', 'GET'); expect(overviewResponse.status, await overviewResponse.clone().text()).toBe(200); const overview = await overviewResponse.json(); const result = overview.students.find((item: { id: string }) => item.id === student.id); expect(result.financial.personId).toBe(people[1].id); expect(result.representations).toHaveLength(0); expect(result.pickup).toHaveLength(0);
  });
  it('rejeita vigência inválida, auto vínculo e versão desatualizada', async () => {
    const people = await db.person.createManyAndReturn({ data: [{ name: 'Aluno Limite', email: null, phone: null, birthDate: null }, { name: 'Pessoa Limite', email: null, phone: null, birthDate: null }] }); const student = await db.studentProfile.create({ data: { personId: people[0].id } });
    expect((await call(`/students/${student.id}/parentage`, 'POST', { personId: people[1].id, role: 'OTHER', evidence: 'Data inválida fictícia', validFrom: '2025-01-01', validUntil: '2024-01-01' })).status).toBe(400);
    expect((await call(`/students/${student.id}/parentage`, 'POST', { personId: people[0].id, role: 'OTHER', evidence: 'Auto vínculo inválido', validFrom: '2024-01-01', validUntil: '2025-01-01' })).status).toBe(409);
    const link = await (await call(`/students/${student.id}/parentage`, 'POST', { personId: people[1].id, role: 'OTHER', evidence: 'Vínculo fictício', validFrom: '2024-01-01', validUntil: '2025-01-01' })).json(); expect((await call(`/students/${student.id}/parentage/${link.id}`, 'PUT', { version: 0, reason: 'Versão inválida', data: { personId: people[1].id, role: 'OTHER', evidence: 'Atualização', validFrom: '2024-01-01', validUntil: '2025-01-01' } })).status).toBe(400);
  });
  it('registra auditoria para pessoa, aluno e vínculos', async () => {
    const actions = await db.auditEvent.findMany({ where: { action: { startsWith: 'PERSON_' } } }); expect(actions.length).toBeGreaterThan(0); expect(await db.auditEvent.count({ where: { action: 'STUDENT_CREATED' } })).toBeGreaterThan(0); expect(await db.auditEvent.count({ where: { action: 'PEOPLE_PARENTAGE_CREATED' } })).toBeGreaterThan(0);
  });
});
