import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { cancellationInputSchema, creditAllocationInputSchema, enrollmentConfirmationSchema, enrollmentInputSchema, enrollmentOverviewSchema, enrollmentSchema, negotiationInputSchema, paymentInputSchema, paymentReversalSchema, refundInputSchema, type EnrollmentOverview } from '@smartschool/contracts';
import { Prisma } from '@smartschool/database';
import { AccessService, type Principal } from '../access/access.service.js';

type EnrollmentDraftWithRelations = Prisma.EnrollmentDraftGetPayload<{ include: { student: { include: { person: true } }; classroom: true; campaign: true; contract: true; financialResponsible: true } }>;
type EnrollmentWithRelations = Prisma.EnrollmentGetPayload<{ include: { student: { include: { person: true } }; classroom: true; settlement: true; obligations: { include: { negotiation: true } }; negotiations: true; payments: { include: { credit: true } }; credits: true; cancellation: { include: { refund: true } } } }>;
type EnrollmentBasic = Prisma.EnrollmentGetPayload<{ include: { student: { include: { person: true } }; classroom: true; settlement: true; obligations: true } }>;
type CancellationWithRefund = Prisma.EnrollmentCancellationGetPayload<{ include: { refund: true } }>;

@Injectable()
export class EnrollmentService {
  constructor(private readonly access: AccessService) {}

  async overview(): Promise<EnrollmentOverview> {
    return this.access.db.$transaction(async tx => {
      const [enrollments, confirmed, students, classrooms, campaigns, contracts] = await Promise.all([
        tx.enrollmentDraft.findMany({ include: { student: { include: { person: true } }, classroom: true, campaign: true, contract: true, financialResponsible: true }, orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }] }),
        tx.enrollment.findMany({ include: { student: { include: { person: true } }, classroom: true, settlement: true, obligations: { include: { negotiation: true } }, negotiations: true, payments: { include: { credit: true } }, credits: true, cancellation: { include: { refund: true } } }, orderBy: [{ confirmedAt: 'desc' }, { id: 'desc' }] }),
        tx.studentProfile.findMany({ where: { active: true, financial: { isNot: null } }, include: { person: true, financial: { include: { person: true } } }, orderBy: { person: { name: 'asc' } } }),
        tx.classroom.findMany({ where: { active: true }, select: { id: true, name: true, capacity: true, occupied: true, active: true, schoolYearId: true }, orderBy: { name: 'asc' } }),
        tx.campaign.findMany({ where: { status: { not: 'ARCHIVED' } }, select: { id: true, name: true, schoolYearId: true }, orderBy: [{ name: 'asc' }, { id: 'asc' }] }),
        tx.contractVersion.findMany({ select: { id: true, campaignId: true, title: true, version: true, initialInstallmentCents: true, totalAnnualCents: true }, orderBy: [{ campaignId: 'asc' }, { version: 'desc' }] }),
      ]);
      return enrollmentOverviewSchema.parse({
        enrollments: enrollments.filter(item => !confirmed.some(saved => saved.draftId === item.id)).map(item => this.public(item)),
        confirmed: confirmed.map(item => this.confirmedOverview(item)),
        students: students.map(item => ({ id: item.id, person: { id: item.person.id, name: item.person.name }, financialResponsible: item.financial ? { id: item.financial.person.id, name: item.financial.person.name } : null })),
        classrooms, campaigns, contracts,
      });
    }, { isolationLevel: 'RepeatableRead' });
  }

  async save(principal: Principal, input: unknown, edit?: { id: string; version: number; reason: string }) {
    const data = enrollmentInputSchema.parse(input);
    const { entryMonth, ...enrollmentData } = data;
    try {
      return await this.access.db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
        if (!['DIRECTOR', 'SECRETARY'].includes(principal.user.role)) throw new ForbiddenException('Matrículas são restritas à Direção e à Secretaria.');
        const [student, classroom, campaign, contract, offer] = await Promise.all([
          tx.studentProfile.findUnique({ where: { id: data.studentId }, include: { financial: true } }),
          tx.classroom.findUnique({ where: { id: data.classroomId } }),
          tx.campaign.findUnique({ where: { id: data.campaignId } }),
          tx.contractVersion.findUnique({ where: { id: data.contractId } }),
          tx.campaignOffer.findUnique({ where: { campaignId_classroomId: { campaignId: data.campaignId, classroomId: data.classroomId } } }),
        ]);
        if (!student || !student.active) throw new NotFoundException('Aluno ativo não encontrado.');
        if (!student.financial || student.financial.personId !== data.financialResponsibleId) throw new ConflictException('O responsável financeiro informado não está vinculado ao aluno.');
        if (!classroom || !classroom.active) throw new NotFoundException('Turma ativa não encontrada.');
        if (!campaign || campaign.status === 'ARCHIVED') throw new NotFoundException('Campanha não encontrada.');
        if (!contract || contract.campaignId !== campaign.id) throw new ConflictException('O plano não pertence à campanha selecionada.');
        if (!offer || offer.classroomId !== classroom.id) throw new ConflictException('A turma não está ofertada na campanha.');
        if (classroom.occupied >= classroom.capacity) throw new ConflictException('A turma não possui vaga disponível.');
        const before = edit ? await tx.enrollmentDraft.findUnique({ where: { id: edit.id } }) : null;
        if (edit && !before) throw new NotFoundException('Rascunho de matrícula não encontrado.');
        if (edit && before && before.version !== edit.version) throw new ConflictException('O rascunho mudou. Atualize a consulta.');
        const lateEntryInstallmentCount = entryMonth ? 13 - entryMonth : null;
        const lateEntryTotalCents = entryMonth ? contract.initialInstallmentCents + lateEntryInstallmentCount! * contract.remainingInstallmentCents : null;
        const draftData = { ...enrollmentData, initialAmountCents: contract.initialInstallmentCents, lateEntryMonth: entryMonth ?? null, lateEntryInstallmentCount, lateEntryTotalCents };
        const saved = edit ? await tx.enrollmentDraft.update({ where: { id: edit.id }, data: { ...draftData, version: { increment: 1 } }, include: { student: { include: { person: true } }, classroom: true, campaign: true, contract: true, financialResponsible: true } }) : await tx.enrollmentDraft.create({ data: draftData, include: { student: { include: { person: true } }, classroom: true, campaign: true, contract: true, financialResponsible: true } });
        await tx.auditEvent.create({ data: { actorId: principal.user.id, action: `ENROLLMENT_DRAFT_${edit ? 'UPDATED' : 'CREATED'}`, targetId: saved.id, reason: edit?.reason ?? 'Rascunho de matrícula salvo', changes: { before: JSON.stringify(before), after: JSON.stringify(saved) } } });
        return enrollmentSchema.parse(this.public(saved));
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Já existe um rascunho para este aluno, turma, campanha e plano.');
      if (error instanceof Error) throw error;
      throw new BadRequestException('Não foi possível salvar o rascunho.');
    }
  }

  async confirm(principal: Principal, draftId: string, input: unknown): Promise<unknown> {
    const data = enrollmentConfirmationSchema.parse(input);
    try {
      return await this.access.db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
        if (!['DIRECTOR', 'SECRETARY'].includes(principal.user.role)) throw new ForbiddenException('Confirmações são restritas à Direção e à Secretaria.');
        if (data.settlement !== 'PAYMENT' && principal.user.role !== 'DIRECTOR') throw new ForbiddenException('Dispensa e negociação são restritas à Direção.');
        const previous = await tx.initialSettlement.findUnique({ where: { operationKey: data.operationKey }, include: { enrollment: { include: { student: { include: { person: true } }, classroom: true, settlement: true, obligations: true } } } });
        if (previous) return this.confirmedPublic(previous.enrollment);
        const draft = await tx.enrollmentDraft.findUnique({ where: { id: draftId }, include: { contract: true } });
        if (!draft) throw new NotFoundException('Rascunho de matrícula não encontrado.');
        if (draft.version !== data.draftVersion) throw new ConflictException('O rascunho mudou. Atualize a consulta.');
        const already = await tx.enrollment.findUnique({ where: { draftId }, include: { student: { include: { person: true } }, classroom: true, settlement: true, obligations: true } });
        if (already) throw new ConflictException('Este rascunho já foi confirmado.');
        if (data.amountCents !== draft.initialAmountCents) throw new ConflictException('A liquidação inicial precisa corresponder à parcela inicial do plano.');
        const classroomRows = await tx.$queryRaw<Array<{ id: string; occupied: number; capacity: number }>>`SELECT "id", "occupied", "capacity" FROM "Classroom" WHERE "id" = ${draft.classroomId} FOR UPDATE`;
        const classroom = classroomRows[0];
        if (!classroom) throw new NotFoundException('Turma não encontrada.');
        if (classroom.occupied >= classroom.capacity) throw new ConflictException('A última vaga já foi ocupada.');
        const enrollment = await tx.enrollment.create({ data: { draftId, studentId: draft.studentId, classroomId: draft.classroomId, campaignId: draft.campaignId, contractId: draft.contractId, financialResponsibleId: draft.financialResponsibleId }, include: { student: { include: { person: true } }, classroom: true, settlement: true, obligations: true } });
        await tx.initialSettlement.create({ data: { enrollmentId: enrollment.id, operationKey: data.operationKey, kind: data.settlement, amountCents: data.amountCents, method: data.method ?? null, reason: data.reason ?? 'Parcela inicial recebida manualmente', actorId: principal.user.id } });
        const lateEntryDate = draft.lateEntryMonth ? `${draft.contract.validUntil.slice(0, 4)}-${String(draft.lateEntryMonth).padStart(2, '0')}-01` : null;
        await tx.financialObligation.create({ data: { enrollmentId: enrollment.id, installment: 0, dueDate: lateEntryDate ?? draft.contract.validFrom, amountCents: draft.initialAmountCents, settledAmountCents: draft.initialAmountCents, status: data.settlement === 'PAYMENT' ? 'SETTLED' : 'WAIVED' } });
        const remainingCount = draft.lateEntryInstallmentCount ?? draft.contract.remainingInstallmentCount;
        const remaining = Array.from({ length: remainingCount }, (_, index) => ({ enrollmentId: enrollment.id, installment: index + 1, dueDate: lateEntryDate ? this.addMonths(lateEntryDate, index) : this.addMonths(draft.contract.validFrom, index + 1), amountCents: draft.contract.remainingInstallmentCents, status: 'OPEN' as const }));
        if (remaining.length) await tx.financialObligation.createMany({ data: remaining });
        await tx.classroom.update({ where: { id: draft.classroomId }, data: { occupied: { increment: 1 }, version: { increment: 1 } } });
        await tx.auditEvent.create({ data: { actorId: principal.user.id, action: 'ENROLLMENT_CONFIRMED', targetId: enrollment.id, reason: data.reason ?? 'Matrícula confirmada com recebimento inicial manual', changes: { settlement: data.settlement, amountCents: data.amountCents, classroomId: draft.classroomId, generatedInstallments: remaining.length, lateEntryMonth: draft.lateEntryMonth, lateEntryTotalCents: draft.lateEntryTotalCents } } });
        const saved = await tx.enrollment.findUniqueOrThrow({ where: { id: enrollment.id }, include: { student: { include: { person: true } }, classroom: true, settlement: true, obligations: true } });
        return this.confirmedPublic(saved);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('A confirmação já foi registrada ou a combinação já existe.');
      if (error instanceof Error) throw error;
      throw new BadRequestException('Não foi possível confirmar a matrícula.');
    }
  }

  async receive(principal: Principal, enrollmentId: string, input: unknown): Promise<unknown> {
    const data = paymentInputSchema.parse(input);
    try {
      return await this.access.db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
        if (!['DIRECTOR', 'SECRETARY'].includes(principal.user.role)) throw new ForbiddenException('Recebimentos são restritos à Direção e à Secretaria.');
        const previous = await tx.paymentReceipt.findUnique({ where: { operationKey: data.operationKey }, include: { credit: true } });
        if (previous) return this.paymentPublic(previous);
        const enrollment = await tx.enrollment.findUnique({ where: { id: enrollmentId }, include: { obligations: true } });
        if (!enrollment) throw new NotFoundException('Matrícula confirmada não encontrada.');
        if (enrollment.status === 'CANCELLED') throw new ConflictException('Não é possível receber em matrícula cancelada.');
        const obligations = await tx.financialObligation.findMany({ where: { id: { in: data.allocations.map(item => item.obligationId) }, enrollmentId } });
        if (obligations.length !== data.allocations.length) throw new ConflictException('Uma ou mais obrigações não pertencem à matrícula.');
        const byId = new Map(obligations.map(obligation => [obligation.id, obligation]));
        for (const allocation of data.allocations) { const obligation = byId.get(allocation.obligationId)!; if (obligation.status === 'WAIVED' || obligation.settledAmountCents + allocation.amountCents > obligation.amountCents) throw new ConflictException('A alocação supera o saldo da obrigação.'); }
        const payment = await tx.paymentReceipt.create({ data: { enrollmentId, operationKey: data.operationKey, receiptNumber: `REC-${randomUUID().slice(0, 8).toUpperCase()}`, amountCents: data.amountCents, method: data.method, reason: data.reason ?? null, actorId: principal.user.id }, include: { credit: true } });
        await tx.paymentAllocation.createMany({ data: data.allocations.map(item => ({ paymentId: payment.id, obligationId: item.obligationId, amountCents: item.amountCents })) });
        for (const allocation of data.allocations) { const obligation = byId.get(allocation.obligationId)!; const settledAmountCents = obligation.settledAmountCents + allocation.amountCents; await tx.financialObligation.update({ where: { id: obligation.id }, data: { settledAmountCents, status: settledAmountCents === obligation.amountCents ? 'SETTLED' : 'PARTIAL' } }); }
        const allocatedCents = data.allocations.reduce((total, item) => total + item.amountCents, 0); if (data.amountCents > allocatedCents) await tx.financialCredit.create({ data: { enrollmentId, sourcePaymentId: payment.id, originalAmountCents: data.amountCents - allocatedCents, balanceCents: data.amountCents - allocatedCents } });
        await tx.auditEvent.create({ data: { actorId: principal.user.id, action: 'PAYMENT_RECEIVED', targetId: payment.id, reason: data.reason ?? 'Recebimento manual registrado', changes: { amountCents: data.amountCents, allocatedCents, creditCents: data.amountCents - allocatedCents } } });
        const saved = await tx.paymentReceipt.findUniqueOrThrow({ where: { id: payment.id }, include: { credit: true } }); return this.paymentPublic(saved);
      });
    } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('A operação de recebimento já foi registrada.'); if (error instanceof Error) throw error; throw new BadRequestException('Não foi possível registrar o recebimento.'); }
  }

  async negotiate(principal: Principal, enrollmentId: string, input: unknown): Promise<unknown> {
    const data = negotiationInputSchema.parse(input);
    try {
      return await this.access.db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
        if (principal.user.role !== 'DIRECTOR') throw new ForbiddenException('Negociações são restritas à Direção.');
        const previous = await tx.financialNegotiation.findUnique({ where: { operationKey: data.operationKey } });
        if (previous) return previous;
        const enrollment = await tx.enrollment.findUnique({ where: { id: enrollmentId }, include: { obligations: { include: { negotiation: true } } } });
        if (!enrollment) throw new NotFoundException('Matrícula confirmada não encontrada.');
        if (enrollment.status === 'CANCELLED') throw new ConflictException('Não é possível negociar matrícula cancelada.');
        const firstOpen = enrollment.obligations.filter(item => item.installment > 0 && item.status !== 'SETTLED' && item.status !== 'WAIVED' && item.status !== 'CANCELLED').sort((left, right) => left.installment - right.installment)[0];
        if (!firstOpen || firstOpen.id !== data.obligationId) throw new ConflictException('Somente a primeira obrigação restante pode ser negociada.');
        if (firstOpen.negotiation) throw new ConflictException('Esta obrigação já possui negociação registrada.');
        if (data.negotiatedAmountCents < firstOpen.settledAmountCents) throw new ConflictException('O valor negociado não pode ficar abaixo do valor já liquidado.');
        const negotiation = await tx.financialNegotiation.create({ data: { enrollmentId, obligationId: firstOpen.id, operationKey: data.operationKey, originalAmountCents: firstOpen.amountCents, negotiatedAmountCents: data.negotiatedAmountCents, originalDueDate: firstOpen.dueDate, negotiatedDueDate: data.negotiatedDueDate, reason: data.reason, actorId: principal.user.id } });
        const status = firstOpen.settledAmountCents === data.negotiatedAmountCents ? 'SETTLED' : firstOpen.settledAmountCents > 0 ? 'PARTIAL' : 'OPEN';
        await tx.financialObligation.update({ where: { id: firstOpen.id }, data: { amountCents: data.negotiatedAmountCents, dueDate: data.negotiatedDueDate, status } });
        await tx.auditEvent.create({ data: { actorId: principal.user.id, action: 'FINANCIAL_NEGOTIATED', targetId: negotiation.id, reason: data.reason, changes: { enrollmentId, obligationId: firstOpen.id, originalAmountCents: firstOpen.amountCents, negotiatedAmountCents: data.negotiatedAmountCents, originalDueDate: firstOpen.dueDate, negotiatedDueDate: data.negotiatedDueDate } } });
        return negotiation;
      });
    } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('A negociação já foi registrada.'); if (error instanceof Error) throw error; throw new BadRequestException('Não foi possível registrar a negociação.'); }
  }

  async cancel(principal: Principal, enrollmentId: string, input: unknown): Promise<unknown> {
    const data = cancellationInputSchema.parse(input);
    if (!this.isCivilDate(data.effectiveDate)) throw new BadRequestException('Informe uma data efetiva válida.');
    try {
      return await this.access.db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
        if (principal.user.role !== 'DIRECTOR') throw new ForbiddenException('Cancelamentos são restritos à Direção.');
        const previous = await tx.enrollmentCancellation.findUnique({ where: { operationKey: data.operationKey }, include: { refund: true } });
        if (previous) return this.cancellationPublic(previous);
        const enrollment = await tx.enrollment.findUnique({ where: { id: enrollmentId }, include: { contract: true, classroom: true, settlement: true, cancellation: { include: { refund: true } }, obligations: { include: { allocations: { include: { payment: true } } } }, credits: true } });
        if (!enrollment) throw new NotFoundException('Matrícula confirmada não encontrada.');
        if (enrollment.status === 'CANCELLED' || enrollment.cancellation) throw new ConflictException('Esta matrícula já foi cancelada.');
        if (data.effectiveDate > enrollment.contract.validUntil) throw new ConflictException('A data efetiva não pode ultrapassar o fim do contrato.');
        const classroomRows = await tx.$queryRaw<Array<{ id: string; occupied: number }>>`SELECT "id", "occupied" FROM "Classroom" WHERE "id" = ${enrollment.classroomId} FOR UPDATE`;
        const classroom = classroomRows[0];
        if (!classroom || classroom.occupied < 1) throw new ConflictException('A matrícula não possui vaga ocupada para liberar.');
        let futurePaidCents = 0;
        for (const obligation of enrollment.obligations) {
          const isFuture = obligation.dueDate >= data.effectiveDate;
          if (!isFuture) continue;
          for (const allocation of obligation.allocations) if (allocation.payment.status === 'POSTED') futurePaidCents += allocation.amountCents;
          if (obligation.status !== 'WAIVED' && obligation.status !== 'CANCELLED') await tx.financialObligation.update({ where: { id: obligation.id }, data: { status: 'CANCELLED' } });
        }
        const initialObligation = enrollment.obligations.find(obligation => obligation.installment === 0);
        if (enrollment.settlement?.kind === 'PAYMENT' && initialObligation && initialObligation.dueDate >= data.effectiveDate) futurePaidCents += enrollment.settlement.amountCents;
        const availableCreditCents = enrollment.credits.filter(credit => credit.status === 'AVAILABLE').reduce((total, credit) => total + credit.balanceCents, 0);
        const cancellation = await tx.enrollmentCancellation.create({ data: { enrollmentId, operationKey: data.operationKey, effectiveDate: data.effectiveDate, reason: data.reason, actorId: principal.user.id, refundableAmountCents: futurePaidCents + availableCreditCents, availableCreditCents } });
        await tx.enrollment.update({ where: { id: enrollmentId }, data: { status: 'CANCELLED', version: { increment: 1 } } });
        await tx.classroom.update({ where: { id: enrollment.classroomId }, data: { occupied: { decrement: 1 }, version: { increment: 1 } } });
        await tx.auditEvent.create({ data: { actorId: principal.user.id, action: 'ENROLLMENT_CANCELLED', targetId: cancellation.id, reason: data.reason, changes: { enrollmentId, effectiveDate: data.effectiveDate, futurePaidCents, availableCreditCents, refundableAmountCents: futurePaidCents + availableCreditCents } } });
        return this.cancellationPublic({ ...cancellation, refund: null });
      });
    } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('O cancelamento já foi registrado.'); if (error instanceof Error) throw error; throw new BadRequestException('Não foi possível cancelar a matrícula.'); }
  }

  async refund(principal: Principal, enrollmentId: string, input: unknown): Promise<unknown> {
    const data = refundInputSchema.parse(input);
    try {
      return await this.access.db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
        if (principal.user.role !== 'DIRECTOR') throw new ForbiddenException('Restituições são restritas à Direção.');
        const previous = await tx.financialRefund.findUnique({ where: { operationKey: data.operationKey } });
        if (previous) return previous;
        const cancellation = await tx.enrollmentCancellation.findUnique({ where: { enrollmentId }, include: { refund: true, enrollment: { include: { credits: true } } } });
        if (!cancellation) throw new ConflictException('Cancele a matrícula antes de registrar a restituição.');
        if (cancellation.refund) throw new ConflictException('A restituição desta matrícula já foi registrada.');
        if (data.amountCents !== cancellation.refundableAmountCents) throw new ConflictException(`A restituição deve corresponder ao valor apurado de ${cancellation.refundableAmountCents} centavos.`);
        if (data.amountCents <= 0) throw new ConflictException('Não há valor positivo apurado para restituir.');
        for (const credit of cancellation.enrollment.credits) if (credit.status === 'AVAILABLE') await tx.financialCredit.update({ where: { id: credit.id }, data: { status: 'REVERSED', balanceCents: 0 } });
        const refund = await tx.financialRefund.create({ data: { enrollmentId, cancellationId: cancellation.id, operationKey: data.operationKey, amountCents: data.amountCents, method: data.method, reason: data.reason, actorId: principal.user.id } });
        await tx.auditEvent.create({ data: { actorId: principal.user.id, action: 'FINANCIAL_REFUNDED', targetId: refund.id, reason: data.reason, changes: { enrollmentId, cancellationId: cancellation.id, amountCents: data.amountCents, method: data.method } } });
        return refund;
      });
    } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('A restituição já foi registrada.'); if (error instanceof Error) throw error; throw new BadRequestException('Não foi possível registrar a restituição.'); }
  }

  async reversePayment(principal: Principal, paymentId: string, input: unknown): Promise<unknown> {
    const data = paymentReversalSchema.parse(input);
    try {
      return await this.access.db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
        if (!['DIRECTOR', 'SECRETARY'].includes(principal.user.role)) throw new ForbiddenException('Reversões são restritas à Direção e à Secretaria.');
        const payment = await tx.paymentReceipt.findUnique({ where: { id: paymentId }, include: { allocations: true, credit: true, enrollment: true } });
        if (!payment) throw new NotFoundException('Recebimento não encontrado.');
        if (payment.enrollment.status === 'CANCELLED') throw new ConflictException('Não é possível reverter recebimento de matrícula cancelada.');
        if (payment.reverseOperationKey === data.operationKey) return this.paymentPublic(payment);
        if (payment.status === 'REVERSED') throw new ConflictException('Este recebimento já foi revertido.');
        if (payment.credit && payment.credit.balanceCents !== payment.credit.originalAmountCents) throw new ConflictException('Destinação de crédito impede a reversão deste recebimento.');
        for (const allocation of payment.allocations) { const obligation = await tx.financialObligation.findUniqueOrThrow({ where: { id: allocation.obligationId } }); const settledAmountCents = obligation.settledAmountCents - allocation.amountCents; await tx.financialObligation.update({ where: { id: obligation.id }, data: { settledAmountCents, status: settledAmountCents === 0 ? 'OPEN' : settledAmountCents === obligation.amountCents ? 'SETTLED' : 'PARTIAL' } }); }
        const saved = await tx.paymentReceipt.update({ where: { id: paymentId }, data: { status: 'REVERSED', reversedAt: new Date(), reverseReason: data.reason, reverseOperationKey: data.operationKey }, include: { credit: true } }); if (payment.credit) await tx.financialCredit.update({ where: { id: payment.credit.id }, data: { status: 'REVERSED', balanceCents: 0 } });
        await tx.auditEvent.create({ data: { actorId: principal.user.id, action: 'PAYMENT_REVERSED', targetId: paymentId, reason: data.reason, changes: { amountCents: payment.amountCents } } }); return this.paymentPublic(saved);
      });
    } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('A reversão já foi registrada.'); if (error instanceof Error) throw error; throw new BadRequestException('Não foi possível reverter o recebimento.'); }
  }

  async allocateCredit(principal: Principal, creditId: string, input: unknown): Promise<unknown> {
    const data = creditAllocationInputSchema.parse(input);
    try {
      return await this.access.db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
        if (!['DIRECTOR', 'SECRETARY'].includes(principal.user.role)) throw new ForbiddenException('Créditos são restritos à Direção e à Secretaria.');
        const previous = await tx.creditAllocation.findUnique({ where: { operationKey: data.operationKey } }); if (previous) return previous;
        const credit = await tx.financialCredit.findUnique({ where: { id: creditId }, include: { enrollment: true } }); const obligation = await tx.financialObligation.findUnique({ where: { id: data.obligationId } });
        if (!credit || credit.status !== 'AVAILABLE' || credit.balanceCents < data.amountCents) throw new ConflictException('Crédito indisponível ou insuficiente.');
        if (credit.enrollment.status === 'CANCELLED') throw new ConflictException('Não é possível destinar crédito de matrícula cancelada.');
        if (!obligation || obligation.enrollmentId !== credit.enrollmentId || obligation.status === 'WAIVED' || obligation.status === 'CANCELLED' || obligation.settledAmountCents + data.amountCents > obligation.amountCents) throw new ConflictException('A obrigação não aceita esta destinação.');
        const allocation = await tx.creditAllocation.create({ data: { creditId, obligationId: data.obligationId, operationKey: data.operationKey, amountCents: data.amountCents } }); const balanceCents = credit.balanceCents - data.amountCents; await tx.financialCredit.update({ where: { id: creditId }, data: { balanceCents, status: balanceCents === 0 ? 'CONSUMED' : 'AVAILABLE' } }); const settledAmountCents = obligation.settledAmountCents + data.amountCents; await tx.financialObligation.update({ where: { id: obligation.id }, data: { settledAmountCents, status: settledAmountCents === obligation.amountCents ? 'SETTLED' : 'PARTIAL' } }); await tx.auditEvent.create({ data: { actorId: principal.user.id, action: 'CREDIT_ALLOCATED', targetId: allocation.id, reason: 'Crédito destinado à obrigação', changes: { amountCents: data.amountCents, obligationId: obligation.id } } }); return allocation;
      });
    } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('A destinação de crédito já foi registrada.'); if (error instanceof Error) throw error; throw new BadRequestException('Não foi possível destinar o crédito.'); }
  }

  private confirmedOverview(item: EnrollmentWithRelations) {
    return { id: item.id, student: { id: item.student.id, person: { id: item.student.person.id, name: item.student.person.name } }, classroom: { id: item.classroom.id, name: item.classroom.name, schoolYearId: item.classroom.schoolYearId }, status: item.status, initialSettlement: { settlement: item.settlement?.kind ?? 'PAYMENT', amountCents: item.settlement?.amountCents ?? 0 }, remainingInstallments: item.obligations.filter(obligation => obligation.installment > 0 && obligation.status !== 'CANCELLED').length, cancellation: item.cancellation ? this.cancellationPublic(item.cancellation) : null, obligations: item.obligations.map(obligation => ({ ...obligation, negotiation: obligation.negotiation ? { originalAmountCents: obligation.negotiation.originalAmountCents, negotiatedAmountCents: obligation.negotiation.negotiatedAmountCents, originalDueDate: obligation.negotiation.originalDueDate, negotiatedDueDate: obligation.negotiation.negotiatedDueDate, reason: obligation.negotiation.reason } : null })), negotiations: item.negotiations.map(negotiation => ({ id: negotiation.id, obligationId: negotiation.obligationId, originalAmountCents: negotiation.originalAmountCents, negotiatedAmountCents: negotiation.negotiatedAmountCents, originalDueDate: negotiation.originalDueDate, negotiatedDueDate: negotiation.negotiatedDueDate, reason: negotiation.reason, createdAt: negotiation.createdAt.toISOString() })), payments: item.payments.map(payment => ({ id: payment.id, receiptNumber: payment.receiptNumber, amountCents: payment.amountCents, status: payment.status, receivedAt: payment.receivedAt.toISOString(), credit: payment.credit ? { id: payment.credit.id, balanceCents: payment.credit.balanceCents, status: payment.credit.status } : null })), credits: item.credits.map(credit => ({ id: credit.id, originalAmountCents: credit.originalAmountCents, balanceCents: credit.balanceCents, status: credit.status })) };
  }

  private cancellationPublic(item: CancellationWithRefund) { return { id: item.id, effectiveDate: item.effectiveDate, reason: item.reason, refundableAmountCents: item.refundableAmountCents, availableCreditCents: item.availableCreditCents, refund: item.refund ? { id: item.refund.id, amountCents: item.refund.amountCents, method: item.refund.method, status: item.refund.status, reason: item.refund.reason, executedAt: item.refund.executedAt.toISOString() } : null }; }

  private isCivilDate(value: string) { const date = new Date(`${value}T00:00:00Z`); return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value; }

  private paymentPublic(item: { id: string; receiptNumber: string; amountCents: number; status: string; credit?: { id: string; balanceCents: number; status: string } | null }) { return { id: item.id, receiptNumber: item.receiptNumber, amountCents: item.amountCents, status: item.status, credit: item.credit ? { id: item.credit.id, balanceCents: item.credit.balanceCents, status: item.credit.status } : null }; }

  private addMonths(value: string, months: number) {
    const date = new Date(`${value}T12:00:00Z`); date.setUTCMonth(date.getUTCMonth() + months); return date.toISOString().slice(0, 10);
  }

  private confirmedPublic(item: EnrollmentBasic) { return { id: item.id, student: { id: item.student.id, person: { id: item.student.person.id, name: item.student.person.name } }, classroom: { id: item.classroom.id, name: item.classroom.name, schoolYearId: item.classroom.schoolYearId }, initialSettlement: { settlement: item.settlement?.kind ?? 'PAYMENT', amountCents: item.settlement?.amountCents ?? 0 }, remainingInstallments: item.obligations.filter(obligation => obligation.installment > 0).length }; }

  private public(item: EnrollmentDraftWithRelations) {
    return { id: item.id, studentId: item.studentId, classroomId: item.classroomId, campaignId: item.campaignId, contractId: item.contractId, financialResponsibleId: item.financialResponsibleId, pendingItems: item.pendingItems, status: item.status, initialAmountCents: item.initialAmountCents, version: item.version, entryMonth: item.lateEntryMonth, entryInstallmentCount: item.lateEntryInstallmentCount, entryTotalCents: item.lateEntryTotalCents, student: { id: item.student.id, person: { id: item.student.person.id, name: item.student.person.name } }, classroom: { id: item.classroom.id, name: item.classroom.name, capacity: item.classroom.capacity, occupied: item.classroom.occupied, active: item.classroom.active, schoolYearId: item.classroom.schoolYearId }, campaign: { id: item.campaign.id, name: item.campaign.name, schoolYearId: item.campaign.schoolYearId }, contract: { id: item.contract.id, campaignId: item.contract.campaignId, title: item.contract.title, version: item.contract.version, initialInstallmentCents: item.contract.initialInstallmentCents, totalAnnualCents: item.contract.totalAnnualCents }, financialResponsible: { id: item.financialResponsible.id, name: item.financialResponsible.name } };
  }
}
