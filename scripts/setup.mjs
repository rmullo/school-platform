import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const template = await readFile(new URL('.env.example', root), 'utf8');
const dbPassword = randomBytes(24).toString('hex');
const storagePassword = randomBytes(24).toString('hex');
const jwtSecret = randomBytes(48).toString('hex');
const content = template.replaceAll('generated-by-setup', dbPassword)
  .replace('S3_SECRET_KEY=' + dbPassword, 'S3_SECRET_KEY=' + storagePassword)
  .replace('AUTH_JWT_SECRET=' + dbPassword, 'AUTH_JWT_SECRET=' + jwtSecret);
try {
  await writeFile(new URL('.env', root), content, { flag: 'wx', mode: 0o600 });
  console.log('Configuração local criada em .env. Não compartilhe este arquivo.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  const existing = await readFile(new URL('.env', root), 'utf8');
  const additions = [];
  if (!/^AUTH_JWT_SECRET=/m.test(existing)) additions.push('AUTH_JWT_SECRET=' + jwtSecret);
  if (!/^AUTH_COOKIE_SECURE=/m.test(existing)) additions.push('AUTH_COOKIE_SECURE=false');
  if (additions.length) {
    await writeFile(new URL('.env', root), existing.replace(/\n?$/, '\n') + additions.join('\n') + '\n', { mode: 0o600 });
    console.log('Configuração da MD-02 adicionada; credenciais existentes preservadas.');
  } else console.log('.env já existe; configuração preservada.');
}
