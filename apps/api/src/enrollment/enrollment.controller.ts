import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { enrollmentEditSchema, enrollmentInputSchema } from '@smartschool/contracts';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { AccessGuard } from '../access/access.controller.js';
import type { Principal } from '../access/access.service.js';
import { EnrollmentService } from './enrollment.service.js';
type AuthRequest = Request & { principal: Principal };
function parse<T>(schema: z.ZodType<T>, value: unknown): T { const result = schema.safeParse(value); if (!result.success) throw new BadRequestException(result.error.issues.map(issue => issue.message).join(' ')); return result.data; }
@ApiTags('Matrícula em andamento') @ApiBearerAuth()
@Controller('api/v1/enrollments') @UseGuards(AccessGuard)
export class EnrollmentController {
  constructor(private readonly enrollment: EnrollmentService) {}
  private staff(req: AuthRequest, write = false) { if (!['DIRECTOR', 'SECRETARY'].includes(req.principal.user.role)) throw new ForbiddenException('Matrículas são restritas à Direção e à Secretaria.'); if (write && (req.headers['x-smartschool-client'] !== 'web' || (req.headers.origin && req.headers.origin !== process.env.WEB_ORIGIN))) throw new ForbiddenException('Origem ou identificação do cliente inválida.'); }
  @Get() overview(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) { this.staff(req); res.setHeader('Cache-Control', 'no-store'); return this.enrollment.overview(); }
  @Post() create(@Body() body: unknown, @Req() req: AuthRequest) { this.staff(req, true); return this.enrollment.save(req.principal, parse(enrollmentInputSchema, body)); }
  @Put(':id') update(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest) { this.staff(req, true); const edit = parse(enrollmentEditSchema, body); return this.enrollment.save(req.principal, edit.data, { id: parse(z.uuid(), id), version: edit.version, reason: edit.reason }); }
  @Post(':id/confirm') confirm(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest): Promise<unknown> { this.staff(req, true); return this.enrollment.confirm(req.principal, parse(z.uuid(), id), body); }
  @Post(':id/payments') receive(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest): Promise<unknown> { this.staff(req, true); return this.enrollment.receive(req.principal, parse(z.uuid(), id), body); }
  @Post(':id/negotiate') negotiate(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest): Promise<unknown> { this.staff(req, true); return this.enrollment.negotiate(req.principal, parse(z.uuid(), id), body); }
  @Post(':id/cancel') cancel(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest): Promise<unknown> { this.staff(req, true); return this.enrollment.cancel(req.principal, parse(z.uuid(), id), body); }
  @Post(':id/refund') refund(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest): Promise<unknown> { this.staff(req, true); return this.enrollment.refund(req.principal, parse(z.uuid(), id), body); }
  @Post('/payments/:id/reverse') reverse(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest): Promise<unknown> { this.staff(req, true); return this.enrollment.reversePayment(req.principal, parse(z.uuid(), id), body); }
  @Post('/credits/:id/allocate') allocateCredit(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest): Promise<unknown> { this.staff(req, true); return this.enrollment.allocateCredit(req.principal, parse(z.uuid(), id), body); }
}
