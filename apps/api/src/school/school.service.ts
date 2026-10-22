import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { authorizationCovers, classroomInputSchema, gradeInputSchema, schoolOverviewSchema, schoolYearInputSchema, stageInputSchema, stageSchema, type SchoolOverview, type SchoolResource } from '@smartschool/contracts';
import { Prisma } from '@smartschool/database';
import { AccessService } from '../access/access.service.js';

type Tx = Prisma.TransactionClient;
@Injectable()
export class SchoolService {
  constructor(private readonly access: AccessService) {}

  async overview(): Promise<SchoolOverview> {
    return this.access.db.$transaction(async tx => {
      const years = await tx.schoolYear.findMany({ orderBy: { year: 'desc' } });
      const stages = await tx.schoolStage.findMany({ orderBy: { name: 'asc' } });
      const grades = await tx.schoolGrade.findMany({ orderBy: { name: 'asc' } });
      const classrooms = await tx.classroom.findMany({ include: { schoolYear: true, grade: { include: { stage: true } } }, orderBy: { name: 'asc' } });
      return schoolOverviewSchema.parse({ years, stages, grades, classrooms: classrooms.map(row => {
        const { schoolYear, grade, ...data } = row;
        return { ...data, offerAvailable: row.active && this.covers(grade.stage, schoolYear) };
      }) });
    }, { isolationLevel: 'RepeatableRead' });
  }

  private covers(stage: { authorization: unknown }, year: { startDate: string; endDate: string }) {
    const parsed = stageSchema.shape.authorization.safeParse(stage.authorization);
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    return parsed.success && authorizationCovers(parsed.data, year, today);
  }

  private async actor(tx: Tx, actorId: string) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
    const actor = await tx.user.findUnique({ where: { id: actorId } });
    if (!actor?.active || actor.role !== 'DIRECTOR') throw new ForbiddenException('Estrutura escolar restrita à Direção.');
  }

  private async validateOffers(tx: Tx, resource: SchoolResource, id: string) {
    const where = resource === 'years' ? { schoolYearId: id } : resource === 'stages' ? { grade: { stageId: id } } : resource === 'grades' ? { gradeId: id } : { id };
    const rows = await tx.classroom.findMany({ where: { ...where, active: true }, include: { schoolYear: true, grade: { include: { stage: true } } } });
    if (rows.some(row => !this.covers(row.grade.stage, row.schoolYear))) throw new ConflictException('A autorização precisa cobrir o período letivo e não estar vencida. Desative as ofertas afetadas antes de alterar a referência.');
  }

  async save(resource: SchoolResource, actorId: string, input: unknown, edit?: { id: string; version: number; reason: string }): Promise<unknown> {
    try {
      return await this.access.db.$transaction(async tx => {
        await this.actor(tx, actorId);
        const id = edit?.id;
        const before = !id ? null : resource === 'years' ? await tx.schoolYear.findUnique({ where: { id } }) : resource === 'stages' ? await tx.schoolStage.findUnique({ where: { id } }) : resource === 'grades' ? await tx.schoolGrade.findUnique({ where: { id } }) : await tx.classroom.findUnique({ where: { id } });
        if (edit && !before) throw new NotFoundException('Registro não encontrado.');
        if (edit && before?.version !== edit.version) throw new ConflictException('Este registro mudou. Atualize a consulta e tente novamente.');
        let saved: { id: string };
        if (resource === 'years') {
          const data = schoolYearInputSchema.parse(input);
          saved = id ? await tx.schoolYear.update({ where: { id }, data: { ...data, version: { increment: 1 } } }) : await tx.schoolYear.create({ data });
        } else if (resource === 'stages') {
          const value = stageInputSchema.parse(input);
          const previous = id ? await tx.schoolStage.findUnique({ where: { id } }) : null;
          if (previous && previous.segment !== value.segment && await tx.schoolGrade.count({ where: { stageId: id } })) throw new ConflictException('Etapa com séries vinculadas não pode trocar de segmento.');
          const data = { ...value, authorization: value.authorization ?? Prisma.DbNull };
          saved = id ? await tx.schoolStage.update({ where: { id }, data: { ...data, version: { increment: 1 } } }) : await tx.schoolStage.create({ data });
        } else if (resource === 'grades') {
          const data = gradeInputSchema.parse(input);
          const previous = id ? await tx.schoolGrade.findUnique({ where: { id } }) : null;
          if (previous && previous.stageId !== data.stageId && await tx.classroom.count({ where: { gradeId: id } })) throw new ConflictException('Série com turmas não pode trocar de etapa.');
          saved = id ? await tx.schoolGrade.update({ where: { id }, data: { ...data, version: { increment: 1 } } }) : await tx.schoolGrade.create({ data });
        } else {
          const data = classroomInputSchema.parse(input);
          const previous = id ? await tx.classroom.findUnique({ where: { id } }) : null;
          if (previous && previous.occupied > data.capacity) throw new ConflictException('A capacidade não pode ser inferior à ocupação registrada.');
          if (previous?.occupied && (previous.gradeId !== data.gradeId || previous.schoolYearId !== data.schoolYearId)) throw new ConflictException('Turma ocupada não pode trocar de ano ou série.');
          saved = id ? await tx.classroom.update({ where: { id }, data: { ...data, version: { increment: 1 } } }) : await tx.classroom.create({ data });
        }
        await this.validateOffers(tx, resource, saved.id);
        await tx.auditEvent.create({ data: { actorId, action: `SCHOOL_${resource.toUpperCase()}_${edit ? 'UPDATED' : 'CREATED'}`, targetId: saved.id, reason: edit?.reason ?? 'Estrutura escolar cadastrada', changes: { before: JSON.stringify(before), after: JSON.stringify(saved) } } });
        return saved;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new ConflictException('Já existe um registro com esse nome ou ano no mesmo contexto.');
        if (error.code === 'P2003') throw new BadRequestException('Ano, etapa ou série vinculada não existe. Atualize a consulta.');
        if (error.code === 'P2004') throw new ConflictException('A capacidade deve respeitar a ocupação registrada.');
      }
      throw error;
    }
  }

  async offer(actorId: string, id: string, input: { active: boolean; version: number; reason: string }): Promise<unknown> {
    return this.access.db.$transaction(async tx => {
      await this.actor(tx, actorId);
      const before = await tx.classroom.findUnique({ where: { id } });
      if (!before) throw new NotFoundException('Turma não encontrada.');
      if (before.version !== input.version) throw new ConflictException('A turma mudou. Atualize a consulta.');
      const saved = await tx.classroom.update({ where: { id }, data: { active: input.active, version: { increment: 1 } } });
      await this.validateOffers(tx, 'classrooms', id);
      await tx.auditEvent.create({ data: { actorId, targetId: id, action: input.active ? 'SCHOOL_OFFER_ACTIVATED' : 'SCHOOL_OFFER_DEACTIVATED', reason: input.reason, changes: { before: JSON.stringify(before), after: JSON.stringify(saved) } } });
      return saved;
    });
  }

  async remove(resource: SchoolResource, actorId: string, id: string, input: { version: number; reason: string }): Promise<void> {
    try {
      await this.access.db.$transaction(async tx => {
        await this.actor(tx, actorId);
        const before = resource === 'years' ? await tx.schoolYear.findUnique({ where: { id } }) : resource === 'stages' ? await tx.schoolStage.findUnique({ where: { id } }) : resource === 'grades' ? await tx.schoolGrade.findUnique({ where: { id } }) : await tx.classroom.findUnique({ where: { id } });
        if (!before) throw new NotFoundException('Registro não encontrado.');
        if (before.version !== input.version) throw new ConflictException('Este registro mudou. Atualize a consulta e tente novamente.');
        if (resource === 'years') {
          if (await tx.classroom.count({ where: { schoolYearId: id } })) throw new ConflictException('O ano letivo possui turmas vinculadas. Remova ou transfira as turmas antes de excluir.');
          await tx.schoolYear.delete({ where: { id } });
        } else if (resource === 'stages') {
          if (await tx.schoolGrade.count({ where: { stageId: id } })) throw new ConflictException('A etapa possui séries vinculadas. Remova ou transfira as séries antes de excluir.');
          await tx.schoolStage.delete({ where: { id } });
        } else if (resource === 'grades') {
          if (await tx.classroom.count({ where: { gradeId: id } })) throw new ConflictException('A série possui turmas vinculadas. Remova ou transfira as turmas antes de excluir.');
          await tx.schoolGrade.delete({ where: { id } });
        } else {
          const classroom = await tx.classroom.findUniqueOrThrow({ where: { id } });
          if (classroom.occupied > 0) throw new ConflictException('A turma possui ocupação registrada e não pode ser excluída.');
          if (classroom.active) throw new ConflictException('Desative a oferta antes de excluir a turma.');
          await tx.classroom.delete({ where: { id } });
        }
        await tx.auditEvent.create({ data: { actorId, action: `SCHOOL_${resource.toUpperCase()}_DELETED`, targetId: id, reason: input.reason, changes: { before: JSON.stringify(before), after: null } } });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') throw new ConflictException('O registro ainda possui vínculos. Remova os dependentes antes de excluir.');
      throw error;
    }
  }
}
