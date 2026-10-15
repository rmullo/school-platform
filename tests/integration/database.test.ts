import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { createDatabase, type Database } from '@smartschool/database';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
let container: StartedPostgreSqlContainer;
let db: Database;
describe('PostgreSQL real isolado', () => {
  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:17.9-bookworm').start();
    execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], {
      cwd: fileURLToPath(new URL('../../packages/database/', import.meta.url)),
      env: { ...process.env, DATABASE_URL: container.getConnectionUri() }, stdio: 'pipe',
    });
    db = createDatabase(container.getConnectionUri());
  });
  afterAll(async () => { await db?.$disconnect(); await container?.stop(); });
  it('migração e inicialização idempotente preservam o marcador ao reconectar', async () => {
    const token = randomUUID();
    await db.foundationState.upsert({ where: { key: 'local-environment' }, update: {}, create: { key: 'local-environment', token } });
    await db.foundationState.upsert({ where: { key: 'local-environment' }, update: {}, create: { key: 'local-environment', token: randomUUID() } });
    await db.$disconnect();
    db = createDatabase(container.getConnectionUri());
    expect((await db.foundationState.findUniqueOrThrow({ where: { key: 'local-environment' } })).token).toBe(token);
    expect(await db.foundationState.count()).toBe(1);
  });
  it('uma falha reverte todas as escritas da transação técnica', async () => {
    await expect(db.$transaction(async tx => {
      await tx.foundationState.create({ data: { key: 'must-rollback', token: randomUUID() } });
      throw new Error('falha simulada');
    })).rejects.toThrow('falha simulada');
    expect(await db.foundationState.findUnique({ where: { key: 'must-rollback' } })).toBeNull();
  });
});
