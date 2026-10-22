import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, HttpCode, Param, Patch, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { deleteSchoolSchema, editSchoolSchema, offerInputSchema, schoolInputSchemas, schoolResourceSchema, type SchoolOverview } from '@smartschool/contracts';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { AccessGuard } from '../access/access.controller.js';
import type { Principal } from '../access/access.service.js';
import { SchoolService } from './school.service.js';
type AuthRequest = Request & { principal: Principal };
function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new BadRequestException(result.error.issues.map(issue => issue.message).join(' '));
  return result.data;
}
@ApiTags('Estrutura escolar') @ApiBearerAuth()
@Controller('api/v1/school') @UseGuards(AccessGuard)
export class SchoolController {
  constructor(private readonly school: SchoolService) {}
  private authorize(req: AuthRequest, write = false) {
    if (req.principal.user.role !== 'DIRECTOR') throw new ForbiddenException('Estrutura escolar restrita à Direção.');
    if (write && (req.headers['x-smartschool-client'] !== 'web' || (req.headers.origin && req.headers.origin !== process.env.WEB_ORIGIN))) throw new ForbiddenException('Origem ou identificação do cliente inválida.');
  }
  @Get()
  overview(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response): Promise<SchoolOverview> {
    this.authorize(req); res.setHeader('Cache-Control', 'no-store'); return this.school.overview();
  }
  @Post(':resource')
  create(@Param('resource') resource: string, @Body() body: unknown, @Req() req: AuthRequest): Promise<unknown> {
    this.authorize(req, true); const kind = parse(schoolResourceSchema, resource);
    return this.school.save(kind, req.principal.user.id, parse<unknown>(schoolInputSchemas[kind], body));
  }
  @Put(':resource/:id')
  update(@Param('resource') resource: string, @Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest): Promise<unknown> {
    this.authorize(req, true); const kind = parse(schoolResourceSchema, resource); const edit = parse(editSchoolSchema, body);
    return this.school.save(kind, req.principal.user.id, parse<unknown>(schoolInputSchemas[kind], edit.data), { id: parse(z.uuid(), id), version: edit.version, reason: edit.reason });
  }
  @Delete(':resource/:id')
  @HttpCode(204)
  remove(@Param('resource') resource: string, @Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest): Promise<unknown> {
    this.authorize(req, true); const kind = parse(schoolResourceSchema, resource); const data = parse(deleteSchoolSchema, body);
    return this.school.remove(kind, req.principal.user.id, parse(z.uuid(), id), data);
  }
  @Patch('classrooms/:id/offer')
  offer(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest): Promise<unknown> {
    this.authorize(req, true); return this.school.offer(req.principal.user.id, parse(z.uuid(), id), parse(offerInputSchema, body));
  }
}
