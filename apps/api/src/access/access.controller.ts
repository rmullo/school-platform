import { BadRequestException, Body, Controller, ForbiddenException, Get, HttpCode, Param, Patch, Post, Req, Res, UnauthorizedException, UseGuards, Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request, Response } from 'express';
import { changeUserSchema, createUserSchema, loginSchema, reasonSchema } from '@smartschool/contracts';
import { z } from 'zod';
import { AccessService, type Principal } from './access.service.js';
import { readConfig } from '../config.js';

type AuthRequest = Request & { principal: Principal };
const config = readConfig(process.env);
const cookieName = 'ss_refresh';
const cookieOptions = { httpOnly: true, secure: config.AUTH_COOKIE_SECURE, sameSite: 'strict' as const, path: '/api/v1/auth', maxAge: 7 * 86400000 };
function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new BadRequestException('Confira os campos informados.');
  return parsed.data;
}
function browserWrite(req: Request) {
  if (req.headers.origin && req.headers.origin !== config.WEB_ORIGIN) throw new ForbiddenException('Origem não autorizada.');
  if (req.headers['x-smartschool-client'] !== 'web') throw new ForbiddenException('Identificação do cliente necessária.');
}
function refreshCookie(req: Request) {
  const cookie = req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith(cookieName + '='));
  const value = cookie?.slice(cookieName.length + 1);
  if (!value || !/^[a-zA-Z0-9_-]{64}$/.test(value)) throw new UnauthorizedException('Entre novamente.');
  return value;
}

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private readonly access: AccessService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ') || authorization.length > 2048) throw new UnauthorizedException('Entre para continuar.');
    request.principal = await this.access.authenticate(authorization.slice(7));
    return true;
  }
}

@Controller('api/v1/auth')
export class AuthController {
  private readonly attempts = new Map<string, { count: number; reset: number }>();
  constructor(private readonly access: AccessService) {}
  @Post('login') @HttpCode(200)
  async login(@Body() body: unknown, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    browserWrite(req);
    const input = parse(loginSchema, body);
    const key = req.ip ?? 'local';
    const now = Date.now();
    for (const [k, value] of this.attempts) if (value.reset <= now) this.attempts.delete(k);
    const attempt = this.attempts.get(key) ?? { count: 0, reset: now + 60000 };
    if (attempt.count >= 10 || this.attempts.size >= 10000) {
      res.setHeader('Retry-After', '60');
      const { HttpException } = await import('@nestjs/common');
      throw new HttpException('Muitas tentativas. Aguarde um minuto.', 429);
    }
    attempt.count++; this.attempts.set(key, attempt);
    const result = await this.access.login(input.email, input.password);
    res.cookie(cookieName, result.refresh, cookieOptions);
    res.setHeader('Cache-Control', 'no-store');
    return { accessToken: result.accessToken, user: result.user };
  }
  @Post('refresh') @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    browserWrite(req);
    try {
      const result = await this.access.refresh(refreshCookie(req));
      res.cookie(cookieName, result.refresh, cookieOptions);
      res.setHeader('Cache-Control', 'no-store');
      return { accessToken: result.accessToken, user: result.user };
    } catch (error) { if (error instanceof UnauthorizedException) res.clearCookie(cookieName, cookieOptions); throw error; }
  }
  @Get('me') @UseGuards(AccessGuard)
  me(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) { res.setHeader('Cache-Control', 'no-store'); return req.principal.user; }
  @Post('logout') @UseGuards(AccessGuard) @HttpCode(204)
  async logout(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) {
    browserWrite(req); await this.access.logout(req.principal); res.clearCookie(cookieName, cookieOptions);
  }
}

@Controller('api/v1') @UseGuards(AccessGuard)
export class UsersController {
  constructor(private readonly access: AccessService) {}
  private director(req: AuthRequest) { if (req.principal.user.role !== 'DIRECTOR') throw new ForbiddenException('Acesso restrito à Direção.'); }
  @Get('users')
  users(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) { this.director(req); res.setHeader('Cache-Control', 'no-store'); return this.access.listUsers(); }
  @Post('users')
  create(@Body() body: unknown, @Req() req: AuthRequest) { this.director(req); browserWrite(req); return this.access.createUser(parse(createUserSchema, body), req.principal.user.id); }
  @Patch('users/:id')
  change(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest) { this.director(req); browserWrite(req); return this.access.changeUser(req.principal.user.id, parse(z.uuid(), id), parse(changeUserSchema, body)); }
  @Post('users/:id/revoke') @HttpCode(200)
  revoke(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest) { this.director(req); browserWrite(req); return this.access.changeUser(req.principal.user.id, parse(z.uuid(), id), parse(reasonSchema, body), true); }
  @Get('audit')
  audit(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) { this.director(req); res.setHeader('Cache-Control', 'no-store'); return this.access.audit(); }
}
