import { randomUUID } from 'node:crypto';
import { createDatabase } from '@smartschool/database';
import { test, expect, signIn } from './fixtures.js';

test('Diretor monta estrutura fictícia, ativa oferta, edita capacidade e recupera falha', async ({ page, accounts }) => {
  test.setTimeout(60000);
  const db = createDatabase(process.env.DATABASE_URL!);
  const created: { resource: string; id: string }[] = [];
  const suffix = randomUUID().slice(0, 8);
  const stage = `Etapa fictícia ${suffix}`; const grade = `Série fictícia ${suffix}`; const classroom = `Turma fictícia ${suffix}`;
  const used = new Set((await db.schoolYear.findMany({ select: { year: true } })).map(row => row.year));
  const year = Array.from({ length: 301 }, (_, index) => 2200 - index).find(year => !used.has(year));
  if (!year) throw new Error('Sem ano livre para fixture escolar.');
  async function save(resource: string) {
    const [response] = await Promise.all([page.waitForResponse(response => response.url().endsWith('/api/v1/school/' + resource) && response.request().method() === 'POST'), page.getByRole('button', { name: 'Salvar', exact: true }).click()]);
    expect(response.status()).toBe(201); created.push({ resource, id: (await response.json()).id });
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  async function select(label: string, option: string) { await page.getByRole('combobox', { name: label, exact: true }).click(); await page.getByRole('option', { name: option, exact: true }).click(); }
  try {
    await signIn(page, accounts.director, accounts.password);
    await page.getByRole('link', { name: 'Estrutura escolar', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Estrutura escolar', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cadastrar ano', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Cadastrar ano', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Ano letivo', { exact: true })).toBeFocused();
    await page.getByLabel('Ano letivo', { exact: true }).fill(String(year));
    await page.getByLabel('Início do período letivo').fill(`${year}-02-01`); await page.getByLabel('Fim do período letivo').fill(`${year}-12-01`);
    await save('years');
    await page.getByRole('tab', { name: 'Etapas', exact: true }).click(); await page.getByRole('button', { name: 'Cadastrar etapa' }).click();
    await page.getByRole('textbox', { name: 'Nome', exact: true }).fill(stage);
    await select('Referência de autorização', 'Informar referência');
    await page.getByLabel('Órgão', { exact: true }).fill('Órgão Fictício de Demonstração');
    await page.getByLabel('Ato de autorização', { exact: true }).fill('Ato Fictício 01');
    await page.getByLabel('Referência da evidência', { exact: true }).fill('Evidência fictícia sem validade operacional');
    await page.getByLabel('Início da validade', { exact: true }).fill(`${year}-01-01`); await page.getByLabel('Fim da validade', { exact: true }).fill(`${year}-12-31`);
    await save('stages');
    await page.getByRole('tab', { name: 'Séries', exact: true }).click(); await page.getByRole('button', { name: 'Cadastrar série' }).click();
    await page.getByRole('textbox', { name: 'Nome', exact: true }).fill(grade); await select('Etapa', stage); await save('grades');
    await page.getByRole('tab', { name: 'Turmas', exact: true }).click(); await page.getByRole('button', { name: 'Cadastrar turma' }).click();
    await page.getByRole('textbox', { name: 'Nome', exact: true }).fill(classroom); await select('Ano letivo', String(year)); await select('Série', `${stage} · ${grade}`);
    await page.getByLabel('Capacidade máxima', { exact: true }).fill('12'); await save('classrooms');
    await expect(page.getByText(classroom, { exact: true })).toBeVisible();
    const card = page.getByRole('heading', { name: classroom, exact: true }).locator('..').locator('..');
    await card.getByRole('button', { name: 'Ativar oferta' }).click(); await page.getByLabel('Motivo da alteração').fill('Oferta fictícia para demonstração');
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click(); await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(card.getByText('Oferta disponível para demonstração')).toBeVisible();
    await page.getByRole('button', { name: `Editar ${classroom}`, exact: true }).click();
    await page.getByLabel('Capacidade máxima', { exact: true }).fill('15'); await page.getByLabel('Motivo da alteração').fill('Ajuste fictício de capacidade');
    await page.getByRole('button', { name: 'Salvar', exact: true }).click(); await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(card.getByText(/0\/15 vagas ocupadas/)).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 1000 }); await page.screenshot({ path: 'test-results/md03-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: 'test-results/md03-mobile.png', fullPage: true });
    await page.route('**/api/v1/school', route => route.abort()); await page.getByRole('button', { name: 'Atualizar', exact: true }).click();
    await expect(page.getByText('Não foi possível atualizar a estrutura.', { exact: false })).toBeVisible(); await expect(page.getByText(classroom, { exact: true })).toHaveCount(0);
    await page.unroute('**/api/v1/school'); await page.getByRole('button', { name: 'Atualizar', exact: true }).click(); await expect(page.getByText(classroom, { exact: true })).toBeVisible();
    await card.getByRole('button', { name: 'Desativar oferta' }).click();
    await page.getByLabel('Motivo da alteração').fill('Retirada fictícia antes da exclusão');
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click(); await expect(page.getByRole('dialog')).toHaveCount(0);
    await card.getByRole('button', { name: `Excluir ${classroom}`, exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('A exclusão é permanente.');
    await page.getByLabel('Motivo da alteração').fill('Remoção fictícia da turma');
    const [deleteResponse] = await Promise.all([page.waitForResponse(response => response.url().endsWith(`/api/v1/school/classrooms/${created.find(row => row.resource === 'classrooms')?.id}`) && response.request().method() === 'DELETE'), page.getByRole('button', { name: 'Excluir definitivamente', exact: true }).click()]);
    expect(deleteResponse.status()).toBe(204); await expect(page.getByText(classroom, { exact: true })).toHaveCount(0);
  } finally {
    const ids = created.map(row => row.id);
    await db.$transaction(async tx => {
      await tx.auditEvent.deleteMany({ where: { targetId: { in: ids } } });
      await tx.classroom.deleteMany({ where: { id: { in: ids } } }); await tx.schoolGrade.deleteMany({ where: { id: { in: ids } } });
      await tx.schoolStage.deleteMany({ where: { id: { in: ids } } }); await tx.schoolYear.deleteMany({ where: { id: { in: ids } } });
    }); await db.$disconnect();
  }
});
test('Secretaria não recebe navegação ou acesso à estrutura escolar', async ({ page, accounts }) => {
  await signIn(page, accounts.secretary, accounts.password);
  await expect(page.getByRole('link', { name: 'Estrutura escolar', exact: true })).toHaveCount(0);
  await page.goto('/estrutura'); await expect(page.getByRole('heading', { name: 'Bom ter você por aqui.' })).toBeVisible();
});
