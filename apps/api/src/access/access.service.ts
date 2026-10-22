import { ConflictException, ForbiddenException, Injectable, OnModuleDestroy, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { hash, verify, argon2id } from 'argon2';
import { SignJWT, jwtVerify } from 'jose';
import { createDatabase, type Database } from '@smartschool/database';
import { createUserSchema, type PublicUser } from '@smartschool/contracts';
import { readConfig } from '../config.js';

const publicFields = { id: true, name: true, email: true, role: true, active: true } as const;
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
const passwordOptions = { type: argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 } as const;
export type Principal = { user: PublicUser; sessionId: string };
export type SessionResult = { user: PublicUser; accessToken: string; refresh: string };
export type AuditRecord = { id: string; actorId: string | null; action: string; targetId: string; reason: string; createdAt: Date };

@Injectable()
export class AccessService implements OnModuleDestroy {
  private readonly config = readConfig(process.env);
  readonly db: Database = createDatabase(this.config.DATABASE_URL);
  private readonly key = new TextEncoder().encode(this.config.AUTH_JWT_SECRET);
  private readonly dummy = hash(randomBytes(32), passwordOptions);
  async onModuleDestroy() { await this.db.$disconnect(); }

  private async token(user: PublicUser, sessionId: string) {
    return new SignJWT({ sid: sessionId }).setProtectedHeader({ alg: 'HS256' }).setSubject(user.id)
      .setIssuer('smartschool').setAudience('smartschool-clients').setIssuedAt().setExpirationTime('10m').sign(this.key);
  }

  async authenticate(token: string): Promise<Principal> {
    let sub: string | undefined; let sid: string;
    try {
      const { payload } = await jwtVerify(token, this.key, { algorithms: ['HS256'], issuer: 'smartschool', audience: 'smartschool-clients' });
      sub = payload.sub;
      if (typeof payload.sid !== 'string' || !sub) throw new Error('invalid');
      sid = payload.sid;
    } catch { throw new UnauthorizedException('Sessão inválida. Entre novamente.'); }
    const session = await this.db.session.findUnique({ where: { id: sid }, include: { user: { select: publicFields } } });
    if (!session || session.userId !== sub || session.revokedAt || session.expiresAt <= new Date() || !session.user.active)
      throw new UnauthorizedException('Sessão encerrada. Entre novamente.');
    return { user: session.user, sessionId: session.id };
  }

  async login(email: string, password: string): Promise<SessionResult> {
    const candidate = await this.db.user.findUnique({ where: { email } });
    const valid = await verify(candidate?.passwordHash ?? await this.dummy, password);
    if (!candidate || !valid || !candidate.active) throw new UnauthorizedException('E-mail ou senha inválidos.');
    return this.db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
      const user = await tx.user.findUnique({ where: { id: candidate.id }, select: publicFields });
      if (!user?.active) throw new UnauthorizedException('E-mail ou senha inválidos.');
      const refresh = randomBytes(48).toString('base64url');
      const session = await tx.session.create({ data: { userId: user.id, refreshHash: digest(refresh), familyId: randomUUID(), expiresAt: new Date(Date.now() + 7 * 86400000) } });
      await tx.auditEvent.create({ data: { actorId: user.id, targetId: user.id, action: 'LOGIN', reason: 'Sessão iniciada' } });
      return { user, accessToken: await this.token(user, session.id), refresh };
    });
  }

  async refresh(raw: string): Promise<SessionResult> {
    // The denial is raised AFTER committing replay revocation.
    const result = await this.db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
      const old = await tx.session.findUnique({ where: { refreshHash: digest(raw) }, include: { user: { select: publicFields } } });
      if (!old) return null;
      if (old.consumedAt || old.revokedAt) {
        await tx.session.updateMany({ where: { familyId: old.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
        await tx.auditEvent.create({ data: { actorId: old.userId, targetId: old.userId, action: 'REFRESH_REPLAY', reason: 'Família de sessões revogada' } });
        return null;
      }
      if (!old.user.active || old.expiresAt <= new Date()) return null;
      await tx.session.update({ where: { id: old.id }, data: { consumedAt: new Date() } });
      const refresh = randomBytes(48).toString('base64url');
      const next = await tx.session.create({ data: { userId: old.userId, refreshHash: digest(refresh), familyId: old.familyId, expiresAt: old.expiresAt } });
      return { user: old.user, refresh, accessToken: await this.token(old.user, next.id) };
    });
    if (!result) throw new UnauthorizedException('Sessão encerrada. Entre novamente.');
    return result;
  }

  async logout(principal: Principal) {
    await this.db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
      const session = await tx.session.findUniqueOrThrow({ where: { id: principal.sessionId } });
      await tx.session.updateMany({ where: { familyId: session.familyId }, data: { revokedAt: new Date() } });
      await tx.auditEvent.create({ data: { actorId: principal.user.id, targetId: principal.user.id, action: 'LOGOUT', reason: 'Sessão encerrada pelo usuário' } });
    });
  }

  async listUsers(): Promise<PublicUser[]> { return this.db.user.findMany({ select: publicFields, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 100 }); }
  async audit(): Promise<AuditRecord[]> { return this.db.auditEvent.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 100 }); }

  async createUser(input: ReturnType<typeof createUserSchema.parse>, actorId: string | null): Promise<PublicUser> {
    const passwordHash = await hash(input.password, passwordOptions);
    try {
      return await this.db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
        if (actorId === null) {
          if (await tx.user.count() !== 0) throw new ConflictException('O primeiro acesso já foi configurado.');
          if (input.role !== 'DIRECTOR') throw new ForbiddenException();
        } else {
          const actor = await tx.user.findUnique({ where: { id: actorId } });
          if (!actor?.active || actor.role !== 'DIRECTOR') throw new ForbiddenException();
        }
        const user = await tx.user.create({ data: { name: input.name, email: input.email, role: input.role, passwordHash }, select: publicFields });
        await tx.auditEvent.create({ data: { actorId, targetId: user.id, action: actorId ? 'USER_CREATED' : 'BOOTSTRAP', reason: actorId ? 'Conta individual criada' : 'Primeiro Diretor configurado localmente' } });
        return user;
      });
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') throw new ConflictException('E-mail já cadastrado.');
      throw error;
    }
  }

  async changeUser(actorId: string, id: string, input: { role?: PublicUser['role']; active?: boolean; reason: string }, revokeOnly = false): Promise<PublicUser> {
    return this.db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(2102026)`;
      const actor = await tx.user.findUnique({ where: { id: actorId } });
      if (!actor?.active || actor.role !== 'DIRECTOR') throw new ForbiddenException();
      const target = await tx.user.findUnique({ where: { id } });
      if (!target) throw new ConflictException('Conta não encontrada.');
      if (!revokeOnly && target.active && target.role === 'DIRECTOR' && (input.active === false || (input.role && input.role !== 'DIRECTOR'))) {
        if (await tx.user.count({ where: { role: 'DIRECTOR', active: true } }) <= 1) throw new ConflictException('Mantenha pelo menos um Diretor ativo.');
      }
      const user = revokeOnly ? await tx.user.findUniqueOrThrow({ where: { id }, select: publicFields }) : await tx.user.update({ where: { id }, data: { role: input.role, active: input.active }, select: publicFields });
      await tx.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.auditEvent.create({ data: { actorId, targetId: id, action: revokeOnly ? 'SESSIONS_REVOKED' : 'USER_UPDATED', reason: input.reason } });
      return user;
    });
  }
}
