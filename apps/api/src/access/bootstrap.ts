import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { createUserSchema } from '@smartschool/contracts';
import { AccessService } from './access.service.js';

const access = new AccessService();
try {
  if (!stdin.isTTY) throw new Error('Execute em um terminal interativo.');
  const prompt = createInterface({ input: stdin, output: stdout });
  const name = await prompt.question('Nome do Diretor (fictício no ambiente local): ');
  const email = await prompt.question('E-mail: ');
  prompt.close();
  stdout.write('Senha (12 a 128 caracteres; entrada oculta): ');
  const password = await new Promise<string>((resolve, reject) => {
    let value = '';
    stdin.setRawMode(true); stdin.resume(); stdin.setEncoding('utf8');
    const finish = () => { stdin.off('data', onData); stdin.setRawMode(false); stdin.pause(); stdout.write('\n'); };
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\u0003') { finish(); reject(new Error('Cancelado.')); return; }
        if (char === '\r' || char === '\n') { finish(); resolve(value); return; }
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else if (value.length < 129) value += char;
      }
    };
    stdin.on('data', onData);
  });
  await access.createUser(createUserSchema.parse({ name, email, password, role: 'DIRECTOR' }), null);
  stdout.write('Primeiro Diretor criado. Entre na aplicação.\n');
} catch { console.error('Não foi possível criar o primeiro Diretor. Confira os campos, configuração e se já existem contas.'); process.exitCode = 1; }
finally { await access.onModuleDestroy(); }
