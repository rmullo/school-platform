import { randomUUID } from 'node:crypto';
import { createDatabase } from '@smartschool/database';

const db = createDatabase(process.env.DATABASE_URL);
const fixture = 'SMARTSCHOOL-FIXTURE-200-2026';
const yearNumber = 2026;
const initialCents = 120_000;
const monthlyCents = 90_000;
const totalAnnualCents = 1_200_000;
const names = ['Ana Beatriz', 'Bruno Caio', 'Cecília Duarte', 'Davi Elias', 'Ester Fátima', 'Felipe Gael', 'Gabriela Helena', 'Heitor Ícaro', 'Isadora Júlia', 'João Kaique', 'Kauã Laura', 'Lívia Maitê', 'Miguel Natan', 'Nina Olívia', 'Otávio Pietro', 'Rafaela Sofia', 'Samuel Theo', 'Valentina Yasmin', 'Wesley Yuri', 'Zoe Alice'];
const surnames = ['Almeida', 'Barbosa', 'Cardoso', 'Dantas', 'Evangelista', 'Ferreira', 'Gomes', 'Holanda', 'Ibiapina', 'Jardim', 'Lima', 'Moura', 'Nascimento', 'Oliveira', 'Pereira', 'Queiroz', 'Ribeiro', 'Sampaio', 'Teixeira', 'Vasconcelos'];
const guardianNames = ['Adriana', 'Benedito', 'Catarina', 'Domingos', 'Eliane', 'Fábio', 'Gisele', 'Hugo', 'Irene', 'Jorge', 'Karina', 'Leandro', 'Marina', 'Nelson', 'Patrícia', 'Ronaldo', 'Simone', 'Tadeu', 'Úrsula', 'Vítor'];
const gradeNames = ['Infantil I', 'Infantil II', 'Infantil III', '1º ano', '2º ano', '3º ano', '4º ano', '5º ano'];
const monthDate = (month) => `2026-${String(month).padStart(2, '0')}-01`;
const yearsAgo = (index) => `${2013 + (index % 11)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 26) + 1).padStart(2, '0')}`;
const personName = (index) => `${names[index % names.length]} ${surnames[Math.floor(index / names.length) % surnames.length]} ${String(index + 1).padStart(3, '0')}`;
const guardianName = (group, suffix) => `${guardianNames[group % guardianNames.length]} ${suffix} Família ${String(group + 1).padStart(2, '0')}`;

async function main() {
  const actor = await db.user.findFirst({ where: { role: 'DIRECTOR', active: true }, select: { id: true } });
  if (!actor) throw new Error('Não existe Diretor ativo para registrar a auditoria da fixture.');
  const existingYear = await db.schoolYear.upsert({ where: { year: yearNumber }, update: {}, create: { year: yearNumber, startDate: '2026-02-01', endDate: '2026-12-15', version: 1 } });
  const existingCampaign = await db.campaign.findFirst({ where: { schoolYearId: existingYear.id, name: fixture }, include: { enrollments: { select: { id: true } } } });
  if (existingCampaign) {
    if (existingCampaign.enrollments.length === 200) { console.log('Fixture já carregada: 200 matrículas preservadas.'); return; }
    throw new Error(`A fixture existe com ${existingCampaign.enrollments.length} matrículas; execução interrompida para evitar duplicação parcial.`);
  }

  const schoolYear = existingYear;
  const stageIds = { infantil: randomUUID(), fundamental: randomUUID() };
  const grades = gradeNames.map((name, index) => ({ id: randomUUID(), name: `${name} — Fixture 2026`, stageId: index < 3 ? stageIds.infantil : stageIds.fundamental }));
  const classrooms = grades.map((grade, index) => ({ id: randomUUID(), name: `Turma ${String.fromCharCode(65 + index)} — Fixture 2026`, schoolYearId: schoolYear.id, gradeId: grade.id, capacity: 25, occupied: 25, active: true, version: 1 }));
  const campaign = { id: randomUUID(), schoolYearId: schoolYear.id, name: fixture, status: 'DRAFT', enrollmentStart: '2025-10-01', enrollmentEnd: '2026-02-28', disclosure: 'Dados fictícios para testes locais', calendar: 'Calendário fictício de 2026', vacancyPolicy: 'Capacidade de demonstração' };
  const contract = { id: randomUUID(), campaignId: campaign.id, version: 1, title: 'Plano anual — Fixture 2026', totalAnnualCents, initialInstallmentCents: initialCents, remainingInstallmentCents: monthlyCents, remainingInstallmentCount: 12, siblingDiscountBps: 500, punctualityDiscountCents: 1_500, materialCollectiveRequired: false, terms: 'Contrato fictício sem validade comercial.', validFrom: '2026-02-01', validUntil: '2026-12-31' };
  const offerRows = classrooms.map(classroom => ({ id: randomUUID(), campaignId: campaign.id, classroomId: classroom.id }));
  const familyGroups = Array.from({ length: 50 }, (_, group) => ({ primary: { id: randomUUID(), name: guardianName(group, 'Responsável') }, secondary: { id: randomUUID(), name: guardianName(group, 'Co-responsável') } }));
  const students = Array.from({ length: 200 }, (_, index) => ({ person: { id: randomUUID(), name: personName(index), email: index % 17 === 0 ? null : `aluno.fixture.${String(index + 1).padStart(3, '0')}@example.test`, phone: index % 9 === 0 ? null : `8899${String(100000 + index).slice(-6)}`, birthDate: yearsAgo(index), version: 1 }, student: { id: randomUUID(), personId: '', active: true, version: 1 }, group: Math.floor(index / 4), classroom: classrooms[index % classrooms.length], lateMonth: index >= 150 ? (index % 2 === 0 ? 8 : 9) : null }));
  for (const row of students) row.student.personId = row.person.id;
  const parentage = []; const representations = []; const financial = []; const pickup = [];
  for (const row of students) {
    const family = familyGroups[row.group];
    parentage.push({ id: randomUUID(), studentId: row.student.id, personId: family.primary.id, role: 'MOTHER', evidence: 'Vínculo fictício para teste', validFrom: '2020-01-01', validUntil: '2099-12-31', version: 1 });
    if (row.group % 5 !== 0) parentage.push({ id: randomUUID(), studentId: row.student.id, personId: family.secondary.id, role: row.group % 3 === 0 ? 'OTHER' : 'FATHER', evidence: 'Segundo vínculo fictício para teste', validFrom: '2020-01-01', validUntil: '2099-12-31', version: 1 });
    representations.push({ id: randomUUID(), studentId: row.student.id, personId: family.primary.id, kind: row.group % 7 === 0 ? 'LEGAL_REPRESENTATIVE' : 'LEGAL_GUARDIAN', evidence: row.group % 7 === 0 ? 'Representação fictícia com restrição' : 'Guarda fictícia para teste', restrictions: row.group % 7 === 0 ? 'Retirada somente com autorização adicional' : null, validFrom: '2020-01-01', validUntil: '2099-12-31', version: 1 });
    const payer = row.group % 13 === 0 ? family.secondary : family.primary;
    financial.push({ id: randomUUID(), studentId: row.student.id, personId: payer.id, evidence: row.group % 13 === 0 ? 'Pagador não parental fictício' : 'Responsável financeiro fictício', version: 1 });
    if (row.student.id && row.group % 3 === 0) pickup.push({ id: randomUUID(), studentId: row.student.id, personId: family.secondary.id, evidence: 'Autorização de retirada fictícia', restrictions: row.group % 6 === 0 ? 'Somente dias úteis' : null, validFrom: '2026-01-01', validUntil: '2026-12-31', version: 1 });
  }
  const drafts = []; const enrollments = []; const settlements = []; const obligations = []; const payments = []; const allocations = []; const credits = []; const negotiations = []; const completions = []; const audits = []; let pendingCases = 0;
  for (let index = 0; index < students.length; index += 1) {
    const row = students[index]; const draftId = randomUUID(); const enrollmentId = randomUUID(); const settlementId = randomUUID(); const operationKey = randomUUID(); const lateCount = row.lateMonth ? 13 - row.lateMonth : 12; const lateTotal = row.lateMonth ? initialCents + lateCount * monthlyCents : null; const pendingItems = index % 6 === 0 ? ['Comprovante de endereço fictício'] : index % 11 === 0 ? ['Documento de identidade fictício', 'Assinatura pendente fictícia'] : [];
    if (pendingItems.length > 0) pendingCases += 1;
    drafts.push({ id: draftId, studentId: row.student.id, classroomId: row.classroom.id, campaignId: campaign.id, contractId: contract.id, financialResponsibleId: financial[index].personId, status: 'DRAFT', initialAmountCents: initialCents, lateEntryMonth: row.lateMonth, lateEntryInstallmentCount: row.lateMonth ? lateCount : null, lateEntryTotalCents: lateTotal, pendingItems, version: 1 });
    enrollments.push({ id: enrollmentId, draftId, studentId: row.student.id, classroomId: row.classroom.id, campaignId: campaign.id, contractId: contract.id, financialResponsibleId: financial[index].personId, status: 'CONFIRMED', confirmedAt: new Date('2026-02-01T12:00:00.000Z'), version: 1 });
    const settlementKind = index % 10 === 0 ? 'WAIVER' : index % 7 === 0 ? 'NEGOTIATION' : 'PAYMENT';
    settlements.push({ id: settlementId, enrollmentId, operationKey, kind: settlementKind, amountCents: initialCents, method: settlementKind === 'PAYMENT' ? 'MANUAL' : null, reason: settlementKind === 'PAYMENT' ? 'Recebimento fictício da matrícula' : settlementKind === 'WAIVER' ? 'Dispensa fictícia autorizada pela Direção' : 'Negociação fictícia autorizada pela Direção', actorId: actor.id });
    const firstDate = row.lateMonth ? monthDate(row.lateMonth) : '2026-02-01'; const firstStatus = settlementKind === 'PAYMENT' ? 'SETTLED' : 'WAIVED'; obligations.push({ id: randomUUID(), enrollmentId, installment: 0, dueDate: firstDate, amountCents: initialCents, settledAmountCents: initialCents, status: firstStatus });
    for (let installment = 1; installment <= lateCount; installment += 1) { const month = row.lateMonth ? row.lateMonth + installment - 1 : installment + 1; const dueDate = monthDate(month); obligations.push({ id: randomUUID(), enrollmentId, installment, dueDate, amountCents: monthlyCents, settledAmountCents: 0, status: 'OPEN' }); }
    completions.push({ id: randomUUID(), enrollmentId, complete: pendingItems.length === 0 && index % 8 !== 0, reason: pendingItems.length ? 'Pendência documental fictícia' : index % 8 === 0 ? 'Revisão administrativa fictícia pendente' : null, actorId: actor.id });
    audits.push({ id: randomUUID(), actorId: actor.id, action: 'FIXTURE_ENROLLMENT_CREATED', targetId: enrollmentId, reason: 'Massa fictícia SMARTSCHOOL-FIXTURE-200-2026', changes: { index: index + 1, pendingItems, lateEntryMonth: row.lateMonth, settlementKind } });
  }
  const monthlyObligations = obligations.filter(row => row.installment > 0);
  for (let index = 0; index < 200; index += 1) { const enrollmentId = enrollments[index].id; const candidate = monthlyObligations.find(row => row.enrollmentId === enrollmentId && row.installment === 1); if (index % 4 === 0 && candidate) { const paymentId = randomUUID(); payments.push({ id: paymentId, enrollmentId, operationKey: randomUUID(), receiptNumber: `FIX-REC-${String(index + 1).padStart(3, '0')}`, amountCents: index % 8 === 0 ? 100_000 : index % 12 === 0 ? 45_000 : monthlyCents, method: index % 3 === 0 ? 'PIX-MANUAL' : index % 3 === 1 ? 'DINHEIRO' : 'TRANSFERENCIA-MANUAL', status: 'POSTED', reason: 'Recebimento fictício para teste', actorId: actor.id }); const allocated = index % 8 === 0 ? 90_000 : index % 12 === 0 ? 45_000 : monthlyCents; allocations.push({ id: randomUUID(), paymentId, obligationId: candidate.id, amountCents: allocated }); candidate.settledAmountCents = allocated; candidate.status = allocated === candidate.amountCents ? 'SETTLED' : 'PARTIAL'; if (index % 8 === 0) credits.push({ id: randomUUID(), enrollmentId, sourcePaymentId: paymentId, originalAmountCents: 10_000, balanceCents: 10_000, status: 'AVAILABLE' }); } }
  for (let index = 0; index < 18; index += 1) { const enrollmentId = enrollments[index * 7].id; const obligation = monthlyObligations.find(row => row.enrollmentId === enrollmentId && row.installment === 2); if (obligation) { negotiations.push({ id: randomUUID(), enrollmentId, obligationId: obligation.id, operationKey: randomUUID(), originalAmountCents: monthlyCents, negotiatedAmountCents: 80_000, originalDueDate: obligation.dueDate, negotiatedDueDate: '2026-08-15', reason: 'Acordo fictício de teste', actorId: actor.id }); obligation.amountCents = 80_000; obligation.dueDate = '2026-08-15'; } }
  const requirements = [{ id: randomUUID(), name: 'Documento de identidade — Fixture 2026', description: 'Requisito fictício', stageId: stageIds.infantil, required: true, active: true }, { id: randomUUID(), name: 'Comprovante de endereço — Fixture 2026', description: 'Requisito fictício', stageId: null, required: true, active: true }, { id: randomUUID(), name: 'Autorização de imagem — Fixture 2026', description: 'Requisito opcional fictício', stageId: stageIds.fundamental, required: false, active: true }];
  const kits = grades.map((grade, index) => ({ id: randomUUID(), schoolYearId: schoolYear.id, gradeId: grade.id, name: `Kit ${grade.name}`, active: true, version: 1 })); const items = kits.flatMap((kit, index) => [{ id: randomUUID(), kitId: kit.id, name: `Livro principal ${index + 1}`, kind: 'BOOK', source: index % 3 === 0 ? 'EXTERNAL' : 'SCHOOL', optional: true, priceCents: index % 3 === 0 ? 0 : 35_000 }, { id: randomUUID(), kitId: kit.id, name: `Material de apoio ${index + 1}`, kind: 'MATERIAL', source: 'COURTESY', optional: true, priceCents: 0 }, { id: randomUUID(), kitId: kit.id, name: `Camiseta opcional ${index + 1}`, kind: 'UNIFORM', source: 'SCHOOL', optional: true, priceCents: 45_000 }]);

  await db.$transaction(async tx => {
    await tx.schoolStage.createMany({ data: [{ id: stageIds.infantil, name: 'Infantil — Fixture 2026', segment: 'INFANTIL', authorization: { demonstration: true, reference: fixture }, version: 1 }, { id: stageIds.fundamental, name: 'Fundamental — Fixture 2026', segment: 'FUNDAMENTAL', authorization: { demonstration: true, reference: fixture }, version: 1 }] });
    await tx.schoolGrade.createMany({ data: grades }); await tx.classroom.createMany({ data: classrooms }); await tx.campaign.create({ data: campaign }); await tx.contractVersion.create({ data: contract }); await tx.campaignOffer.createMany({ data: offerRows });
    await tx.person.createMany({ data: [...students.map(row => row.person), ...familyGroups.flatMap(group => [group.primary, group.secondary])] }); await tx.studentProfile.createMany({ data: students.map(row => row.student) }); await tx.studentParentage.createMany({ data: parentage }); await tx.studentRepresentation.createMany({ data: representations }); await tx.studentFinancialResponsible.createMany({ data: financial }); await tx.pickupAuthorization.createMany({ data: pickup });
    await tx.enrollmentDraft.createMany({ data: drafts }); await tx.enrollment.createMany({ data: enrollments }); await tx.initialSettlement.createMany({ data: settlements }); await tx.financialObligation.createMany({ data: obligations }); await tx.paymentReceipt.createMany({ data: payments }); await tx.paymentAllocation.createMany({ data: allocations }); await tx.financialCredit.createMany({ data: credits }); await tx.financialNegotiation.createMany({ data: negotiations }); await tx.enrollmentCompletion.createMany({ data: completions }); await tx.documentRequirement.createMany({ data: requirements }); await tx.materialKit.createMany({ data: kits }); await tx.materialItem.createMany({ data: items }); await tx.auditEvent.createMany({ data: audits });
  }, { timeout: 30_000, maxWait: 30_000 });
  console.log(JSON.stringify({ fixture, students: students.length, enrollments: enrollments.length, classrooms: classrooms.length, obligations: obligations.length, payments: payments.length, credits: credits.length, negotiations: negotiations.length, pendingDocumentCases: pendingCases, stages: 2, grades: grades.length, kits: kits.length }, null, 2));
}

try { await main(); } finally { await db.$disconnect(); }
