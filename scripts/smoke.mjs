import assert from 'node:assert/strict';
import { FileStorage, storageConfigFromEnv } from '@smartschool/storage';
import { environmentStatusSchema } from '@smartschool/contracts';
const api = process.env.SMOKE_API_URL ?? 'http://localhost:3333';
const web = process.env.SMOKE_WEB_URL ?? 'http://localhost:5173';
const health = await fetch(api + '/health', { signal: AbortSignal.timeout(10000) });
assert.equal(health.status, 200);
const ready = await fetch(api + '/ready', { headers: { 'x-correlation-id': 'md01-smoke' }, signal: AbortSignal.timeout(10000) });
assert.equal(ready.status, 200);
assert.equal(ready.headers.get('x-correlation-id'), 'md01-smoke');
const state = environmentStatusSchema.omit({ installation: true }).parse(await ready.json());
assert.equal(state.status, 'ready');
const proxied = await fetch(web + '/api/v1/status', { signal: AbortSignal.timeout(10000) });
assert.equal(proxied.status, 401);
assert.equal((await fetch(api + '/api/v1/users')).status, 401);
assert.equal((await fetch(api + '/api/docs-json')).status, 200);
const storage = new FileStorage(storageConfigFromEnv(process.env));
try {
  assert.equal(await storage.readExample(), 'SmartSchool: arquivo fictício da MD-01.\n');
  const anonymous = await fetch(process.env.S3_ENDPOINT + '/' + process.env.S3_BUCKET + '/foundation/example.txt');
  assert.equal(anonymous.status, 403);
} finally { storage.close(); }
console.log('Smoke aprovado: API, prontidão, proxy protegido, Swagger, correlationId e arquivo privado.');
