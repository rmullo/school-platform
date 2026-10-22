import { randomUUID } from 'node:crypto';
import { createDatabase } from '@smartschool/database';
import { test, expect, signIn } from './fixtures.js';

test('Secretaria cadastra pessoas, aluno e filiação sem misturar os papéis', async ({ page, accounts }) => {
  test.setTimeout(60000); const db = createDatabase(process.env.DATABASE_URL!); const people: string[] = []; let studentId = ''; const suffix = randomUUID().slice(0, 8);
  async function savePerson(name: string) { await page.getByRole('button', { name: 'Cadastrar pessoa', exact: true }).click(); await page.getByLabel('Nome completo').fill(name); await page.getByRole('button', { name: 'Salvar', exact: true }).click(); await expect(page.getByRole('dialog')).toHaveCount(0); const person = await db.person.findFirstOrThrow({ where: { name } }); people.push(person.id); }
  try {
    await signIn(page, accounts.secretary, accounts.password); await page.getByRole('link', { name: 'Pessoas e vínculos', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Pessoas e vínculos', exact: true })).toBeVisible();
    await savePerson(`Aluno Fictício ${suffix}`); await savePerson(`Mãe Fictícia ${suffix}`); await savePerson(`Guardião Fictício ${suffix}`);
    await page.getByRole('tab', { name: 'Alunos e vínculos', exact: true }).click(); await page.getByRole('button', { name: 'Cadastrar aluno', exact: true }).click(); await page.getByLabel('Pessoa', { exact: true }).click(); await page.getByRole('option', { name: `Aluno Fictício ${suffix}`, exact: true }).click(); await page.getByRole('button', { name: 'Cadastrar aluno', exact: true }).last().click(); await expect(page.getByRole('dialog')).toHaveCount(0);
    const student = await db.studentProfile.findFirstOrThrow({ where: { person: { name: `Aluno Fictício ${suffix}` } } }); studentId = student.id; const card = page.getByRole('heading', { name: `Aluno Fictício ${suffix}`, exact: true }).locator('..').locator('..');
    await card.getByRole('button', { name: 'Adicionar filiação', exact: true }).click(); await page.getByLabel('Pessoa', { exact: true }).click(); await page.getByRole('option', { name: `Mãe Fictícia ${suffix}`, exact: true }).click(); await page.getByLabel('Evidência ou referência').fill('Referência fictícia de filiação'); await page.getByLabel('Início da vigência').fill('2024-01-01'); await page.getByLabel('Fim da vigência').fill('2099-12-31'); await page.getByRole('button', { name: 'Adicionar vínculo', exact: true }).click(); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(page.getByText('1 filiação(ões)', { exact: true })).toBeVisible(); await page.screenshot({ path: 'test-results/md04-people.png', fullPage: true });
  } finally {
    await db.$transaction(async tx => { if (studentId) { await tx.studentParentage.deleteMany({ where: { studentId } }); await tx.studentProfile.delete({ where: { id: studentId } }); } if (people.length) { await tx.auditEvent.deleteMany({ where: { targetId: { in: people } } }); await tx.person.deleteMany({ where: { id: { in: people } } }); } }); await db.$disconnect();
  }
});

test('TI não recebe menu nem acesso a pessoas e vínculos', async ({ page, accounts }) => {
  await signIn(page, accounts.it, accounts.password); await expect(page.getByRole('link', { name: 'Pessoas e vínculos', exact: true })).toHaveCount(0); await page.goto('/pessoas'); await expect(page.getByRole('heading', { name: 'Bom ter você por aqui.', exact: true })).toBeVisible();
});
