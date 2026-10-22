import { test as base, expect, type Page } from '@playwright/test';
import { config } from 'dotenv';
import { randomBytes, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { createDatabase } from '@smartschool/database';
config({ quiet: true });
type Accounts = { director: string; secretary: string; it: string; password: string; ids: string[] };
export const test = base.extend<{}, { accounts: Accounts }>({
  accounts: [async ({}, use) => {
    const url = process.env.DATABASE_URL;
    if (!url || !['localhost', '127.0.0.1'].includes(new URL(url).hostname)) throw new Error('E2E exige banco local fictício.');
    const db = createDatabase(url);
    const requireApi = createRequire(new URL('../../apps/api/package.json', import.meta.url));
    const { hash, argon2id } = requireApi('argon2');
    const password = randomBytes(24).toString('hex');
    const passwordHash = await hash(password, { type: argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 });
    const suffix = randomUUID(); const ids: string[] = [];
    const accounts = { director: `director-${suffix}@example.test`, secretary: `secretary-${suffix}@example.test`, it: `it-${suffix}@example.test`, password, ids };
    try {
      for (const [role, email] of [['DIRECTOR', accounts.director], ['SECRETARY', accounts.secretary], ['IT', accounts.it]] as const) {
        const user = await db.user.create({ data: { name: `Pessoa E2E ${role}`, email, passwordHash, role } }); ids.push(user.id);
      }
      await use(accounts);
    } finally {
      await db.$transaction(async tx => {
        await tx.session.deleteMany({ where: { userId: { in: ids } } });
        await tx.auditEvent.deleteMany({ where: { OR: [{ actorId: { in: ids } }, { targetId: { in: ids } }] } });
        await tx.user.deleteMany({ where: { id: { in: ids } } });
      });
      await db.$disconnect();
    }
  }, { scope: 'worker' }],
});
export { expect };
export async function signIn(page: Page, email: string, password: string) {
  // Prepare authenticated state without consuming the shared proxy's login limit.
  // The dedicated login journey still submits the real form (invalid + valid).
  const { AccessService } = await import('../../apps/api/dist/access/access.service.js');
  const access = new AccessService();
  try {
    const session = await access.login(email, password);
    const origin = new URL(process.env.E2E_BASE_URL ?? 'http://localhost:5173');
    await page.context().addCookies([{ name: 'ss_refresh', value: session.refresh, domain: origin.hostname, path: '/api/v1/auth', httpOnly: true, secure: origin.protocol === 'https:', sameSite: 'Strict' }]);
  } finally { await access.onModuleDestroy(); }
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bom ter você por aqui.' })).toBeVisible();
}
