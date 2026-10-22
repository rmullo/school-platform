import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { enrollmentConfirmationSchema, enrollmentInputSchema, enrollmentOverviewSchema, enrollmentSchema, type EnrollmentOverview } from '@smartschool/contracts';
import { Prisma } from '@smartschool/database';
import { AccessService, type Principal } from '../access/access.service.js';

type EnrollmentDraftWithRelations = Prisma.EnrollmentDraftGetPayload<{ include: { student: { include: { person: true } }; classroom: true; campaign: true; contract: true; financialResponsible: true } }>;
type EnrollmentWithRelations = Prisma.EnrollmentGetPayload<{ include: { student: { include: { person: true } }; classroom: true; settlement: true; obligations: true } }>;

@Injectable()
export class EnrollmentService {
  constructor(private readonly access: AccessService) {}

  async overview(): Promise<EnrollmentOverview> {
    return this.access.db.$transaction(async tx => {
      const [enrollments, confirmed, students, classrooms, campaigns, contracts] = await Promise.all([
        tx.enrollmentDraft.findMany({ include: { student: { include: { person: true } }, classroom: true, campaign: true, contract: true, financialResponsible: true }, orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }] }),
        tx.enrollment.findMany({ include: { student: { include: { person: true } }, classroom: true, settlement: true, obligations: true }, orderBy: [{ confirmedAt: 'desc' }, { id: 'desc' }] }),
        tx.studentProfile.findMany({ where: { active: true, financial: { isNot: null } }, include: { person: true, financial: { include: { person: true } } }, orderBy: { person: { name: 'asc' } } }),
        tx.classroom.findMany({ where: { active: true }, select: { id: true, name: true, capacity: true, occupied: true, active: true, schoolYearId: true }, orderBy: { name: 'asc' } }),
        tx.campaign.findMany({ where: { status: { not: 'ARCHIVED' } }, select: { id: true, name: true, schoolYearId: true }, orderBy: [{ name: 'asc' }, { id: 'asc' }] }),
        tx.contractVersion.findMany({ select: { id: true, campaignId: true, title: true, version: true, initialInstallmentCents: true, totalAnnualCents: true }, orderBy: [{ campaignId: 'asc' }, { version: 'desc' }] }),
      ]);
      return enrollmentOverviewSchema.parse({
        enrollments: enrollments.filter(item => !confirmed.some(saved => saved.draftId === item.id)).map(item => this.public(item)),
        confirmed: confirmed.map(item => ({ id: item.id, student: { id: item.student.id, person: { id: item.student.person.id, name: item.student.person.name } }, classroom: { id: item.classroom.id, name: item.classroom.name, schoolYearId: item.classroom.schoolYearId }, initialSettlement: { settlement: item.settlement?.kind ?? 'PAYMENT', amountCents: item.settlement?.amountCents ?? 0 }, remainingInstallments: item.obligations.filter(obligation => obligation.installment > 0).length })),
        students: students.map(item => ({ id: item.id, person: { id: item.person.id, name: item.person.name }, financialResponsible: item.financial ? { id: item.financial.person.id, name: item.financial.person.name } : null })),
        classrooms, campaigns, contracts,
      });
    }, { isolationLevel: 'RepeatableRead' });
  }

  async save(principal: Principal, input: unknown, edit?: { id: string; version: number; reason: string }) {
    const data = enrollmentInputSchema.parse(input);
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
        const saved = edit ? await tx.enrollmentDraft.update({ where: { id: edit.id }, data: { ...data, initialAmountCents: contract.initialInstallmentCents, version: { increment: 1 } }, include: { student: { include: { person: true } }, classroom: true, campaign: true, contract: true, financialResponsible: true } }) : await tx.enrollmentDraft.create({ data: { ...data, initialAmountCents: contract.initialInstallmentCents }, include: { student: { include: { person: true } }, classroom: true, campaign: true, contract: true, financialResponsible: true } });
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
        await tx.financialObligation.create({ data: { enrollmentId: enrollment.id, installment: 0, dueDate: draft.contract.validFrom, amountCents: draft.initialAmountCents, status: data.settlement === 'PAYMENT' ? 'SETTLED' : 'WAIVED' } });
        const remaining = Array.from({ length: draft.contract.remainingInstallmentCount }, (_, index) => ({ enrollmentId: enrollment.id, installment: index + 1, dueDate: this.addMonths(draft.contract.validFrom, index + 1), amountCents: draft.contract.remainingInstallmentCents, status: 'OPEN' as const }));
        if (remaining.length) await tx.financialObligation.createMany({ data: remaining });
        await tx.classroom.update({ where: { id: draft.classroomId }, data: { occupied: { increment: 1 }, version: { increment: 1 } } });
        await tx.auditEvent.create({ data: { actorId: principal.user.id, action: 'ENROLLMENT_CONFIRMED', targetId: enrollment.id, reason: data.reason ?? 'Matrícula confirmada com recebimento inicial manual', changes: { settlement: data.settlement, amountCents: data.amountCents, classroomId: draft.classroomId, generatedInstallments: remaining.length } } });
        const saved = await tx.enrollment.findUniqueOrThrow({ where: { id: enrollment.id }, include: { student: { include: { person: true } }, classroom: true, settlement: true, obligations: true } });
        return this.confirmedPublic(saved);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('A confirmação já foi registrada ou a combinação já existe.');
      if (error instanceof Error) throw error;
      throw new BadRequestException('Não foi possível confirmar a matrícula.');
    }
  }

  private addMonths(value: string, months: number) {
    const date = new Date(`${value}T12:00:00Z`); date.setUTCMonth(date.getUTCMonth() + months); return date.toISOString().slice(0, 10);
  }

  private confirmedPublic(item: EnrollmentWithRelations) { return { id: item.id, student: { id: item.student.id, person: { id: item.student.person.id, name: item.student.person.name } }, classroom: { id: item.classroom.id, name: item.classroom.name, schoolYearId: item.classroom.schoolYearId }, initialSettlement: { settlement: item.settlement?.kind ?? 'PAYMENT', amountCents: item.settlement?.amountCents ?? 0 }, remainingInstallments: item.obligations.filter(obligation => obligation.installment > 0).length }; }

  private public(item: EnrollmentDraftWithRelations) {
    return { id: item.id, studentId: item.studentId, classroomId: item.classroomId, campaignId: item.campaignId, contractId: item.contractId, financialResponsibleId: item.financialResponsibleId, pendingItems: item.pendingItems, status: item.status, initialAmountCents: item.initialAmountCents, version: item.version, student: { id: item.student.id, person: { id: item.student.person.id, name: item.student.person.name } }, classroom: { id: item.classroom.id, name: item.classroom.name, capacity: item.classroom.capacity, occupied: item.classroom.occupied, active: item.classroom.active, schoolYearId: item.classroom.schoolYearId }, campaign: { id: item.campaign.id, name: item.campaign.name, schoolYearId: item.campaign.schoolYearId }, contract: { id: item.contract.id, campaignId: item.contract.campaignId, title: item.contract.title, version: item.contract.version, initialInstallmentCents: item.contract.initialInstallmentCents, totalAnnualCents: item.contract.totalAnnualCents }, financialResponsible: { id: item.financialResponsible.id, name: item.financialResponsible.name } };
  }
}
