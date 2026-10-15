import { describe, expect, it } from 'vitest';
import { readConfig } from '../../apps/api/src/config.js';
import { environmentStatusSchema } from '@smartschool/contracts';
const valid = { DATABASE_URL: 'postgresql://user:password@localhost:5432/test', S3_ENDPOINT: 'http://localhost:9000', S3_REGION: 'us-east-1', S3_BUCKET: 'example', S3_ACCESS_KEY: 'local', S3_SECRET_KEY: 'not-a-real-secret', WEB_ORIGIN: 'http://localhost:5173' };
describe('Configuração segura', () => {
  it('rejeita configuração ausente antes de atender requisições', () => { expect(() => readConfig({})).toThrow('Configuração inválida'); });
  it('não revela credenciais inválidas no erro', () => {
    expect(() => readConfig({ ...valid, DATABASE_URL: 'secret-that-must-not-leak', API_PORT: '99999' })).toThrow('DATABASE_URL, API_PORT');
    try { readConfig({ ...valid, DATABASE_URL: 'secret-that-must-not-leak' }); } catch (error) { expect(String(error)).not.toContain('secret-that-must-not-leak'); }
  });
  it('aplica porta local e rejeita protocolo de banco incompatível', () => {
    expect(readConfig(valid).API_PORT).toBe(3333);
    expect(() => readConfig({ ...valid, DATABASE_URL: 'https://example.com' })).toThrow();
  });
  it('contrato de estado rejeita uma resposta incompleta', () => {
    expect(environmentStatusSchema.safeParse({ status: 'ready' }).success).toBe(false);
  });
});
