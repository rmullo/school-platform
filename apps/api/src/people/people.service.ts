import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { financialInputSchema, linkEditSchema, parentageInputSchema, peopleOverviewSchema, personEditSchema, personInputSchema, pickupInputSchema, representationInputSchema, studentInputSchema, type PersonResource, type PeopleOverview } from '@smartschool/contracts';
import { Prisma } from '@smartschool/database';
import { AccessService, type Principal } from '../access/access.service.js';

type Tx = Prisma.TransactionClient;
const personInclude = { person: true } as const;

@Injectable()
export class PeopleService {
  constructor(private readonly access: AccessService) {}

  private async actor(tx: Tx, principal: Principal) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
    if (!['DIRECTOR', 'SECRETARY'].includes(principal.user.role)) throw new ForbiddenException('Cadastro de pessoas restrito à Direção e à Secretaria.');
  }

  async overview(): Promise<PeopleOverview> {
    return this.access.db.$transaction(async tx => {
      const people = await tx.person.findMany({ orderBy: [{ name: 'asc' }, { id: 'asc' }], take: 100 });
      const students = await tx.studentProfile.findMany({ orderBy: { id: 'asc' }, take: 100, include: { person: true, parentage: { include: personInclude }, representations: { include: personInclude }, financial: { include: personInclude }, pickup: { include: personInclude } } });
      const groups = new Map<string, { basis: 'PARENTAGE' | 'FINANCIAL_RESPONSIBLE'; studentIds: Set<string> }>();
      for (const student of students) {
        for (const link of student.parentage) this.addGroup(groups, `PARENTAGE:${link.personId}`, 'PARENTAGE', student.id);
        if (student.financial) this.addGroup(groups, `FINANCIAL_RESPONSIBLE:${student.financial.personId}`, 'FINANCIAL_RESPONSIBLE', student.id);
      }
      const publicStudent = students.map(student => ({ ...student, person: this.safePerson(student.person), parentage: student.parentage.map(link => ({ ...link, person: this.safePerson(link.person) })), representations: student.representations.map(link => ({ ...link, person: this.safePerson(link.person) })), financial: student.financial ? { ...student.financial, person: this.safePerson(student.financial.person) } : null, pickup: student.pickup.map(link => ({ ...link, person: this.safePerson(link.person) })) }));
      return peopleOverviewSchema.parse({ people: people.map(person => this.safePerson(person)), students: publicStudent, possibleSiblings: [...groups.values()].filter(group => group.studentIds.size > 1).map(group => ({ basis: group.basis, studentIds: [...group.studentIds].sort() })) });
    }, { isolationLevel: 'RepeatableRead' });
  }

  private addGroup(groups: Map<string, { basis: 'PARENTAGE' | 'FINANCIAL_RESPONSIBLE'; studentIds: Set<string> }>, key: string, basis: 'PARENTAGE' | 'FINANCIAL_RESPONSIBLE', studentId: string) {
    const group = groups.get(key) ?? { basis, studentIds: new Set<string>() };
    group.studentIds.add(studentId); groups.set(key, group);
  }

  async createPerson(principal: Principal, input: unknown) {
    const data = personInputSchema.parse(input);
    try {
      return await this.access.db.$transaction(async tx => {
        await this.actor(tx, principal);
        const person = await tx.person.create({ data });
        await tx.auditEvent.create({ data: { actorId: principal.user.id, action: 'PERSON_CREATED', targetId: person.id, reason: 'Pessoa cadastrada', changes: { after: JSON.stringify(this.safePerson(person)) } } });
        return person;
      });
    } catch (error) { throw this.mapError(error); }
  }

  async updatePerson(principal: Principal, id: string, input: unknown) {
    const parsed = personEditSchema.parse(input);
    try {
      return await this.access.db.$transaction(async tx => {
        await this.actor(tx, principal);
        const before = await tx.person.findUnique({ where: { id } });
        if (!before) throw new NotFoundException('Pessoa não encontrada.');
        if (before.version !== parsed.version) throw new ConflictException('Esta pessoa mudou. Atualize a consulta e tente novamente.');
        const person = await tx.person.update({ where: { id }, data: { ...parsed.data, version: { increment: 1 } } });
        await tx.auditEvent.create({ data: { actorId: principal.user.id, action: 'PERSON_UPDATED', targetId: id, reason: parsed.reason, changes: { before: JSON.stringify(this.safePerson(before)), after: JSON.stringify(this.safePerson(person)) } } });
        return person;
      });
    } catch (error) { throw this.mapError(error); }
  }

  async createStudent(principal: Principal, input: unknown) {
    const data = studentInputSchema.parse(input);
    try {
      return await this.access.db.$transaction(async tx => {
        await this.actor(tx, principal);
        const person = await tx.person.findUnique({ where: { id: data.personId } });
        if (!person) throw new NotFoundException('Pessoa não encontrada.');
        const student = await tx.studentProfile.create({ data });
        await tx.auditEvent.create({ data: { actorId: principal.user.id, action: 'STUDENT_CREATED', targetId: student.id, reason: 'Perfil de aluno criado', changes: { personId: data.personId } } });
        return student;
      });
    } catch (error) { throw this.mapError(error); }
  }

  async createLink(principal: Principal, resource: PersonResource, studentId: string, input: unknown) {
    const data = this.parseLink(resource, input);
    try {
      return await this.access.db.$transaction(async tx => {
        await this.actor(tx, principal);
        await this.assertLinkPeople(tx, studentId, data.personId);
        const link = resource === 'parentage' ? await tx.studentParentage.create({ data: { ...(data as ReturnType<typeof parentageInputSchema.parse>), studentId } }) : resource === 'representation' ? await tx.studentRepresentation.create({ data: { ...(data as ReturnType<typeof representationInputSchema.parse>), studentId } }) : resource === 'financial' ? await tx.studentFinancialResponsible.create({ data: { ...(data as ReturnType<typeof financialInputSchema.parse>), studentId } }) : await tx.pickupAuthorization.create({ data: { ...(data as ReturnType<typeof pickupInputSchema.parse>), studentId } });
        await tx.auditEvent.create({ data: { actorId: principal.user.id, action: `PEOPLE_${resource.toUpperCase()}_CREATED`, targetId: link.id, reason: 'Vínculo cadastrado', changes: { after: JSON.stringify(link) } } });
        return link;
      });
    } catch (error) { throw this.mapError(error); }
  }

  async updateLink(principal: Principal, resource: PersonResource, studentId: string, id: string, input: unknown) {
    const parsed = linkEditSchema.parse(input); const data = this.parseLink(resource, parsed.data);
    try {
      return await this.access.db.$transaction(async tx => {
        await this.actor(tx, principal);
        await this.assertLinkPeople(tx, studentId, data.personId);
        const before = await this.findLink(tx, resource, id, studentId);
        if (!before) throw new NotFoundException('Vínculo não encontrado.');
        if (before.version !== parsed.version) throw new ConflictException('Este vínculo mudou. Atualize a consulta e tente novamente.');
        const link = resource === 'parentage' ? await tx.studentParentage.update({ where: { id }, data: { ...(data as ReturnType<typeof parentageInputSchema.parse>), version: { increment: 1 } } }) : resource === 'representation' ? await tx.studentRepresentation.update({ where: { id }, data: { ...(data as ReturnType<typeof representationInputSchema.parse>), version: { increment: 1 } } }) : resource === 'financial' ? await tx.studentFinancialResponsible.update({ where: { id }, data: { ...(data as ReturnType<typeof financialInputSchema.parse>), version: { increment: 1 } } }) : await tx.pickupAuthorization.update({ where: { id }, data: { ...(data as ReturnType<typeof pickupInputSchema.parse>), version: { increment: 1 } } });
        await tx.auditEvent.create({ data: { actorId: principal.user.id, action: `PEOPLE_${resource.toUpperCase()}_UPDATED`, targetId: id, reason: parsed.reason, changes: { before: JSON.stringify(before), after: JSON.stringify(link) } } });
        return link;
      });
    } catch (error) { throw this.mapError(error); }
  }

  private parseLink(resource: PersonResource, input: unknown) {
    return resource === 'parentage' ? parentageInputSchema.parse(input) : resource === 'representation' ? representationInputSchema.parse(input) : resource === 'financial' ? financialInputSchema.parse(input) : pickupInputSchema.parse(input);
  }

  private async assertLinkPeople(tx: Tx, studentId: string, personId: string) {
    const student = await tx.studentProfile.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Aluno não encontrado.');
    if (student.personId === personId) throw new ConflictException('O aluno não pode ser seu próprio vínculo.');
    if (!(await tx.person.findUnique({ where: { id: personId } }))) throw new NotFoundException('Pessoa vinculada não encontrada.');
  }

  private findLink(tx: Tx, resource: PersonResource, id: string, studentId: string) {
    return resource === 'parentage' ? tx.studentParentage.findFirst({ where: { id, studentId } }) : resource === 'representation' ? tx.studentRepresentation.findFirst({ where: { id, studentId } }) : resource === 'financial' ? tx.studentFinancialResponsible.findFirst({ where: { id, studentId } }) : tx.pickupAuthorization.findFirst({ where: { id, studentId } });
  }

  private safePerson(person: { id: string; name: string; email: string | null; phone: string | null; birthDate: string | null; version: number }) { return { id: person.id, name: person.name, email: person.email, phone: person.phone, birthDate: person.birthDate, version: person.version }; }

  private mapError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return new ConflictException('Este vínculo ou pessoa já existe no contexto informado.');
      if (error.code === 'P2003') return new BadRequestException('Pessoa ou aluno vinculado não existe.');
    }
    return error instanceof Error ? error : new Error('Não foi possível concluir o cadastro.');
  }
}
