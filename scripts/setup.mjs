import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const template = await readFile(new URL('.env.example', root), 'utf8');
const dbPassword = randomBytes(24).toString('hex');
const storagePassword = randomBytes(24).toString('hex');
const content = template.replaceAll('generated-by-setup', dbPassword)
  .replace('S3_SECRET_KEY=' + dbPassword, 'S3_SECRET_KEY=' + storagePassword);
try {
  await writeFile(new URL('.env', root), content, { flag: 'wx', mode: 0o600 });
  console.log('Configuração local criada em .env. Não compartilhe este arquivo.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('.env já existe; configuração preservada.');
}
