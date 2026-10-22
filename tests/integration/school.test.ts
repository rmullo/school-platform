import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execFileSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import type { SchoolYear, SchoolStage, SchoolGrade, Classroom } from '@smartschool/contracts';

let container: StartedPostgreSqlContainer;
let app: { close(): Promise<void>; useGlobalFilters(filter: unknown): void; listen(port: number, host: string): Promise<unknown>; getUrl(): Promise<string>; get<T>(token: new (...args: never[]) => T): T };
let access: import('../../apps/api/src/access/access.service.js').AccessService;
let base = ''; let director = ''; let secretary = ''; let itToken = ''; let actorId = '';
let year: SchoolYear; let stage: SchoolStage; let grade: SchoolGrade; let classroom: Classroom;
const initialEnv = { ...process.env };
const authorization = { authority: 'Órgão Fictício', act: 'Ato Fictício 01', evidence: 'Somente demonstração', validFrom: '2020-01-01', validUntil: '2099-12-31', demonstration: true };
async function call(path: string, method = 'GET', body?: unknown, token = director) {
  return fetch(base + '/api/v1/school' + path, { method, headers: { 'Content-Type': 'application/json', 'x-smartschool-client': 'web', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
}
async function create<T>(path: string, body: unknown): Promise<T> { const response = await call(path, 'POST', body); expect(response.status).toBe(201); return response.json(); }
beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:17.9-bookworm').start();
  Object.assign(process.env, { DATABASE_URL: container.getConnectionUri(), AUTH_JWT_SECRET: randomBytes(48).toString('hex'), AUTH_COOKIE_SECURE: 'false', S3_ENDPOINT: 'http://localhost:59000', S3_REGION: 'us-east-1', S3_BUCKET: 'test-bucket', S3_ACCESS_KEY: 'test', S3_SECRET_KEY: 'fictitious-test-secret', WEB_ORIGIN: 'http://localhost:5173', LOG_LEVEL: 'silent' });
  execFileSync('pnpm', ['db:migrate'], { env: process.env, stdio: 'pipe' });
  const requireApi = createRequire(new URL('../../apps/api/package.json', import.meta.url));
  const { NestFactory } = requireApi('@nestjs/core');
  const { AppModule } = await import('../../apps/api/dist/app.module.js');
  const { AccessService } = await import('../../apps/api/dist/access/access.service.js');
  const { ProblemFilter } = await import('../../apps/api/dist/problem.filter.js');
  app = await NestFactory.create(AppModule, { logger: false }); app.useGlobalFilters(new ProblemFilter());
  await app.listen(0, '127.0.0.1'); base = await app.getUrl(); access = app.get(AccessService);
  const password = randomBytes(24).toString('hex');
  actorId = (await access.createUser({ name: 'Diretor Fictício', email: 'director@example.test', password, role: 'DIRECTOR' }, null)).id;
  director = (await access.login('director@example.test', password)).accessToken;
  for (const role of ['SECRETARY', 'IT'] as const) { const email = `${role.toLowerCase()}@example.test`; await access.createUser({ name: 'Pessoa Fictícia', email, password, role }, actorId); const token = (await access.login(email, password)).accessToken; if (role === 'SECRETARY') secretary = token; else itToken = token; }
}, 90000);
afterAll(async () => { await app?.close(); await container?.stop(); process.env = initialEnv; });
describe('Estrutura escolar com PostgreSQL e API reais', () => {
  it('bloqueia anônimo, Secretaria e TI inclusive escrita direta', async () => {
    expect((await call('', 'GET', undefined, '')).status).toBe(401);
    for (const token of [secretary, itToken]) { expect((await call('', 'GET', undefined, token)).status).toBe(403); expect((await call('/years', 'POST', { year: 2030, startDate: '2030-02-01', endDate: '2030-12-01' }, token)).status).toBe(403); }
  });
  it('cria hierarquia, rejeita duplicação e vínculo inexistente', async () => {
    const data = { year: 2030, startDate: '2030-02-01', endDate: '2030-12-01' };
    year = await create('/years', data);
    expect((await call('/years', 'POST', data)).status).toBe(409);
    stage = await create('/stages', { name: 'Etapa Fictícia', segment: 'INFANTIL', authorization: null });
    grade = await create('/grades', { name: 'Série Fictícia', stageId: stage.id });
    classroom = await create('/classrooms', { name: 'Turma Fictícia', schoolYearId: year.id, gradeId: grade.id, capacity: 10 });
    expect(classroom.active).toBe(false); expect(classroom.occupied).toBe(0);
    expect((await call('/grades', 'POST', { name: 'Sem Etapa', stageId: randomUUID() })).status).toBe(400);
    expect((await call('/classrooms', 'POST', { name: 'Inválida', schoolYearId: year.id, gradeId: grade.id, capacity: -1 })).status).toBe(400);
  });
  it('não ativa sem referência, ativa com cobertura e audita', async () => {
    const url = `/classrooms/${classroom.id}/offer`; const data = { active: true, version: 1, reason: 'Oferta fictícia para teste' };
    expect((await call(url, 'PATCH', data)).status).toBe(409);
    expect((await access.db.classroom.findUniqueOrThrow({ where: { id: classroom.id } })).active).toBe(false);
    const response = await call(`/stages/${stage.id}`, 'PUT', { version: 1, reason: 'Referência fictícia incluída', data: { name: stage.name, segment: stage.segment, authorization } });
    expect(response.status).toBe(200); stage = await response.json();
    expect((await call(url, 'PATCH', data)).status).toBe(200);
    expect(await access.db.auditEvent.count({ where: { targetId: classroom.id, action: 'SCHOOL_OFFER_ACTIVATED' } })).toBe(1);
  });
  it('alteração que invalidaria oferta ativa é revertida junto da auditoria', async () => {
    const count = await access.db.auditEvent.count();
    const response = await call(`/stages/${stage.id}`, 'PUT', { version: stage.version, reason: 'Tentativa fictícia de expiração', data: { name: stage.name, segment: stage.segment, authorization: { ...authorization, validUntil: '2020-12-31' } } });
    expect(response.status).toBe(409); expect(await access.db.auditEvent.count()).toBe(count);
    expect((await access.db.schoolStage.findUniqueOrThrow({ where: { id: stage.id } })).version).toBe(stage.version);
    const yearResponse = await call(`/years/${year.id}`, 'PUT', { version: 1, reason: 'Período fora da referência', data: { year: year.year, startDate: '2100-02-01', endDate: '2100-12-01' } });
    expect(yearResponse.status).toBe(409);
  });
  it('não reduz capacidade abaixo da ocupação inclusive por SQL', async () => {
    await access.db.classroom.update({ where: { id: classroom.id }, data: { occupied: 6 } });
    const response = await call(`/classrooms/${classroom.id}`, 'PUT', { version: 2, reason: 'Redução fictícia inválida', data: { name: classroom.name, gradeId: grade.id, schoolYearId: year.id, capacity: 5 } });
    expect(response.status).toBe(409);
    await expect(access.db.classroom.update({ where: { id: classroom.id }, data: { capacity: 5 } })).rejects.toThrow();
    expect((await access.db.classroom.findUniqueOrThrow({ where: { id: classroom.id } })).capacity).toBe(10);
  });
  it('concorrência com versão esperada aceita apenas uma edição', async () => {
    const responses = await Promise.all([8, 9].map(capacity => call(`/classrooms/${classroom.id}`, 'PUT', { version: 2, reason: 'Ajuste concorrente fictício', data: { name: classroom.name, gradeId: grade.id, schoolYearId: year.id, capacity } })));
    expect(responses.map(response => response.status).sort()).toEqual([200, 409]);
    expect((await access.db.classroom.findUniqueOrThrow({ where: { id: classroom.id } })).version).toBe(3);
  });
  it('falha de auditoria após escrita reverte cadastro e capacidade', async () => {
    const before = await access.db.classroom.findUniqueOrThrow({ where: { id: classroom.id } });
    await access.db.$executeRawUnsafe("CREATE FUNCTION reject_school_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Injected test failure'; END $$");
    await access.db.$executeRawUnsafe('CREATE TRIGGER reject_school_audit BEFORE INSERT ON "AuditEvent" FOR EACH ROW EXECUTE FUNCTION reject_school_audit()');
    try {
      expect((await call(`/classrooms/${classroom.id}`, 'PUT', { version: before.version, reason: 'Teste de rollback da auditoria', data: { name: classroom.name, gradeId: grade.id, schoolYearId: year.id, capacity: 20 } })).status).toBe(500);
      expect(await access.db.classroom.findUniqueOrThrow({ where: { id: classroom.id } })).toEqual(before);
    } finally { await access.db.$executeRawUnsafe('DROP TRIGGER reject_school_audit ON "AuditEvent"'); await access.db.$executeRawUnsafe('DROP FUNCTION reject_school_audit()'); }
  });
  it('consulta não oferece referência vencida e desativação permanece possível', async () => {
    await access.db.schoolStage.update({ where: { id: stage.id }, data: { authorization: { ...authorization, validUntil: '2020-12-31' } } });
    const overview = await (await call('')).json();
    expect(overview.classrooms[0].offerAvailable).toBe(false);
    const current = await access.db.classroom.findUniqueOrThrow({ where: { id: classroom.id } });
    expect((await call(`/classrooms/${classroom.id}/offer`, 'PATCH', { active: false, version: current.version, reason: 'Retirada de oferta fictícia' })).status).toBe(200);
  });
  it('expõe exclusão auditada e protege dependências, ocupação e oferta ativa', async () => {
    expect((await call(`/years/${year.id}`, 'DELETE', { version: 1, reason: 'Excluir ano ainda vinculado' })).status).toBe(409);
    expect((await call(`/grades/${grade.id}`, 'DELETE', { version: 1, reason: 'Excluir série ainda vinculada' })).status).toBe(409);
    await access.db.classroom.update({ where: { id: classroom.id }, data: { occupied: 0, active: true } });
    expect((await call(`/classrooms/${classroom.id}`, 'DELETE', { version: 4, reason: 'Excluir oferta ainda ativa' })).status).toBe(409);
    await access.db.classroom.update({ where: { id: classroom.id }, data: { active: false } });
    expect((await call(`/classrooms/${classroom.id}`, 'DELETE', { version: 4, reason: 'Remover turma fictícia' })).status).toBe(204);
    expect(await access.db.auditEvent.count({ where: { targetId: classroom.id, action: 'SCHOOL_CLASSROOMS_DELETED' } })).toBe(1);
    expect((await call(`/grades/${grade.id}`, 'DELETE', { version: 1, reason: 'Remover série fictícia' })).status).toBe(204);
    expect((await call(`/stages/${stage.id}`, 'DELETE', { version: stage.version, reason: 'Remover etapa fictícia' })).status).toBe(204);
    expect((await call(`/years/${year.id}`, 'DELETE', { version: 1, reason: 'Remover ano fictício' })).status).toBe(204);
  });
});
