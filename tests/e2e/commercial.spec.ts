import { randomUUID } from 'node:crypto';
import { createDatabase } from '@smartschool/database';
import { test, expect, signIn } from './fixtures.js';

test('Diretor cadastra campanha e plano com composição anual fechada', async ({ page, accounts }) => {
  test.setTimeout(60000);
  const db = createDatabase(process.env.DATABASE_URL!);
  const suffix = randomUUID().slice(0, 8);
  let yearId = ''; let stageId = ''; let gradeId = ''; let campaignId = '';
  try {
    const year = await db.schoolYear.create({ data: { year: 2200, startDate: '2200-02-01', endDate: '2200-12-01' } }); yearId = year.id;
    const stage = await db.schoolStage.create({ data: { name: `Etapa comercial ${suffix}`, segment: 'FUNDAMENTAL' } }); stageId = stage.id;
    const grade = await db.schoolGrade.create({ data: { name: `Série comercial ${suffix}`, stageId } }); gradeId = grade.id;
    await db.classroom.create({ data: { name: `Turma comercial ${suffix}`, schoolYearId: yearId, gradeId, capacity: 20 } });
    await signIn(page, accounts.director, accounts.password);
    await page.getByRole('link', { name: 'Campanhas e planos', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Campanhas e planos', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Cadastrar campanha', exact: true }).click();
    await page.getByRole('combobox', { name: 'Ano letivo', exact: true }).click(); await page.getByRole('option', { name: '2200', exact: true }).click();
    await page.getByLabel(/Nome da campanha/).fill(`Campanha comercial ${suffix}`); await page.getByLabel(/Evidência de divulgação/).fill('Referência fictícia de divulgação'); await page.getByLabel(/Calendário/).fill('Calendário fictício'); await page.getByLabel(/Condição de vagas/).fill('Conforme oferta fictícia'); await page.getByRole('button', { name: 'Salvar campanha', exact: true }).click();
    await expect(page.getByText(`Campanha comercial ${suffix}`, { exact: true })).toBeVisible(); campaignId = (await db.campaign.findFirst({ where: { name: `Campanha comercial ${suffix}` } }))!.id;
    await page.getByRole('tab', { name: 'Planos e contratos', exact: true }).click(); await page.getByRole('button', { name: 'Cadastrar plano', exact: true }).click(); await page.getByRole('combobox', { name: 'Campanha', exact: true }).click(); await page.getByRole('option', { name: new RegExp(`Campanha comercial ${suffix}`) }).click(); await page.getByLabel(/Título/).fill('Plano anual fictício'); await page.getByLabel(/Total anual/).fill('1200000'); await page.getByLabel(/Parcela inicial/).fill('120000'); await page.getByLabel(/Cada parcela restante/).fill('90000'); await page.getByLabel(/Quantidade restante/).fill('12'); await page.getByLabel(/Termos resumidos/).fill('Termos fictícios sem material coletivo obrigatório.'); await page.getByRole('button', { name: 'Salvar plano', exact: true }).click();
    await expect(page.getByText(/Plano anual fictício/)).toBeVisible(); await page.setViewportSize({ width: 390, height: 844 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: 'test-results/md05-mobile.png', fullPage: true });
  } finally { if (campaignId) { await db.campaignOffer.deleteMany({ where: { campaignId } }); await db.contractVersion.deleteMany({ where: { campaignId } }); await db.campaign.delete({ where: { id: campaignId } }); } await db.auditEvent.deleteMany({ where: { targetId: { in: [yearId, stageId, gradeId] } } }); if (yearId) await db.classroom.deleteMany({ where: { schoolYearId: yearId } }); if (gradeId) await db.schoolGrade.delete({ where: { id: gradeId } }); if (stageId) await db.schoolStage.delete({ where: { id: stageId } }); if (yearId) await db.schoolYear.delete({ where: { id: yearId } }); await db.$disconnect(); }
});
