import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { campaignInputSchema, campaignOfferInputSchema, commercialOverviewSchema, contractInputSchema, type CommercialOverview } from '@smartschool/contracts';
import { Prisma } from '@smartschool/database';
import { AccessService, type Principal } from '../access/access.service.js';

@Injectable()
export class CommercialService {
  constructor(private readonly access: AccessService) {}
  async overview(): Promise<CommercialOverview> {
    return this.access.db.$transaction(async tx => {
      const [campaigns, contracts, offers, schoolYears, classrooms] = await Promise.all([
        tx.campaign.findMany({ include: { schoolYear: { select: { year: true } } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }),
        tx.contractVersion.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] }),
        tx.campaignOffer.findMany({ include: { classroom: true }, orderBy: { id: 'asc' } }),
        tx.schoolYear.findMany({ select: { id: true, year: true }, orderBy: { year: 'desc' } }),
        tx.classroom.findMany({ select: { id: true, name: true, capacity: true, occupied: true, schoolYearId: true, gradeId: true }, orderBy: { name: 'asc' } }),
      ]);
      return commercialOverviewSchema.parse({ campaigns: campaigns.map(({ createdAt: _campaignCreatedAt, ...row }) => row), contracts: contracts.map(({ createdAt: _contractCreatedAt, ...row }) => row), offers, schoolYears, classrooms });
    }, { isolationLevel: 'RepeatableRead' });
  }
  private async actor(tx: Prisma.TransactionClient, actorId: string) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
    const actor = await tx.user.findUnique({ where: { id: actorId } });
    if (!actor?.active || actor.role !== 'DIRECTOR') throw new ForbiddenException('Campanhas e contratos são restritos à Direção.');
  }
  async saveCampaign(principal: Principal, input: unknown, edit?: { id: string; version: number; reason: string }): Promise<unknown> {
    const data = campaignInputSchema.parse(input);
    try { return await this.access.db.$transaction(async tx => {
      await this.actor(tx, principal.user.id);
      const before = edit ? await tx.campaign.findUnique({ where: { id: edit.id } }) : null;
      if (edit && !before) throw new NotFoundException('Campanha não encontrada.');
      if (edit && before && before.version !== edit.version) throw new ConflictException('A campanha mudou. Atualize a consulta.');
      if (!(await tx.schoolYear.findUnique({ where: { id: data.schoolYearId } }))) throw new BadRequestException('Ano letivo não encontrado.');
      const saved = edit ? await tx.campaign.update({ where: { id: edit.id }, data: { ...data, version: { increment: 1 } } }) : await tx.campaign.create({ data });
      await tx.auditEvent.create({ data: { actorId: principal.user.id, action: `CAMPAIGN_${edit ? 'UPDATED' : 'CREATED'}`, targetId: saved.id, reason: edit?.reason ?? 'Campanha cadastrada', changes: { before: JSON.stringify(before), after: JSON.stringify(saved) } } });
      return saved;
    }); } catch (error) { throw this.mapError(error); }
  }
  async saveContract(principal: Principal, input: unknown, edit?: { id: string; version: number; reason: string }) {
    const data = contractInputSchema.parse(input);
    try { return await this.access.db.$transaction(async tx => {
      await this.actor(tx, principal.user.id);
      const before = edit ? await tx.contractVersion.findUnique({ where: { id: edit.id } }) : null;
      if (edit && !before) throw new NotFoundException('Versão de contrato não encontrada.');
      if (edit && before && before.version !== edit.version) throw new ConflictException('A versão de contrato mudou. Atualize a consulta.');
      if (edit && before && before.campaignId !== data.campaignId) throw new ConflictException('Uma versão não pode ser movida entre campanhas.');
      if (!(await tx.campaign.findUnique({ where: { id: data.campaignId } }))) throw new BadRequestException('Campanha não encontrada.');
      const saved = edit ? await tx.contractVersion.update({ where: { id: edit.id }, data }) : await tx.contractVersion.create({ data });
      await tx.auditEvent.create({ data: { actorId: principal.user.id, action: `CONTRACT_${edit ? 'UPDATED' : 'CREATED'}`, targetId: saved.id, reason: edit?.reason ?? 'Plano contratual cadastrado', changes: { before: JSON.stringify(before), after: JSON.stringify(saved) } } });
      return saved;
    }); } catch (error) { throw this.mapError(error); }
  }
  async addOffer(principal: Principal, input: unknown) {
    const data = campaignOfferInputSchema.parse(input);
    try { return await this.access.db.$transaction(async tx => {
      await this.actor(tx, principal.user.id);
      const [campaign, classroom] = await Promise.all([tx.campaign.findUnique({ where: { id: data.campaignId } }), tx.classroom.findUnique({ where: { id: data.classroomId } })]);
      if (!campaign || !classroom) throw new BadRequestException('Campanha ou turma não encontrada.');
      if (campaign.schoolYearId !== classroom.schoolYearId) throw new ConflictException('A turma precisa pertencer ao mesmo ano letivo da campanha.');
      const offer = await tx.campaignOffer.create({ data });
      await tx.auditEvent.create({ data: { actorId: principal.user.id, action: 'CAMPAIGN_OFFER_CREATED', targetId: offer.id, reason: 'Turma associada à campanha', changes: { after: JSON.stringify(offer) } } });
      return offer;
    }); } catch (error) { throw this.mapError(error); }
  }
  private mapError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return new ConflictException('Já existe uma campanha, versão ou oferta com esses dados.');
    return error instanceof Error ? error : new Error('Não foi possível concluir o cadastro.');
  }
}
