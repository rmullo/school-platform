import { test, expect, signIn } from './fixtures.js';
test.beforeEach(async ({ page, accounts }) => { await signIn(page, accounts.it, accounts.password); });
test('ambiente real disponível e atualização sem perda de identidade', async ({ page }) => {
  await page.goto('/ambiente');
  await expect(page.getByRole('heading', { name: 'Ambiente pronto' })).toBeVisible();
  await expect(page.getByText('Disponível', { exact: true })).toHaveCount(3);
  const identifier = await page.getByTestId('installation-id').textContent();
  await page.getByRole('button', { name: 'Atualizar estado' }).click();
  await expect(page.getByTestId('installation-id')).toHaveText(identifier!);
});
test('falha de rede não mantém indicador antigo de sucesso e permite recuperação', async ({ page }) => {
  await page.goto('/ambiente');
  await expect(page.getByRole('heading', { name: 'Ambiente pronto' })).toBeVisible();
  await page.route('**/api/v1/status', route => route.abort());
  await page.getByRole('button', { name: 'Atualizar estado' }).click();
  await expect(page.getByRole('heading', { name: 'Ambiente precisa de atenção' })).toBeVisible();
  await expect(page.getByText('Indisponível', { exact: true })).toHaveCount(3);
  await expect(page.getByTestId('installation-id')).toHaveCount(0);
  await page.unroute('**/api/v1/status');
  await page.getByRole('button', { name: 'Atualizar estado' }).click();
  await expect(page.getByRole('heading', { name: 'Ambiente pronto' })).toBeVisible();
});
test('dependência indisponível é distinguida de API fora do ar', async ({ page }) => {
  await page.route('**/api/v1/status', route => route.fulfill({ json: { status: 'degraded', checkedAt: new Date().toISOString(), services: { database: 'available', storage: 'unavailable' }, installation: null } }));
  await page.goto('/ambiente');
  await expect(page.getByRole('heading', { name: 'Ambiente precisa de atenção' })).toBeVisible();
  await expect(page.getByText('Disponível', { exact: true })).toHaveCount(2);
  await expect(page.getByText('Indisponível', { exact: true })).toHaveCount(1);
});
test('tela utilizável em largura de celular', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ambiente');
  await expect(page.getByRole('heading', { name: 'Ambiente pronto' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/md01-mobile.png', fullPage: true });
});
