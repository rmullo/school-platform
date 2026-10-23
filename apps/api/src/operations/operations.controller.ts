import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { AccessGuard } from '../access/access.controller.js';
import type { Principal } from '../access/access.service.js';
import { OperationsService } from './operations.service.js';
import type { Request, Response } from 'express';
type AuthRequest = Request & { principal: Principal };
function parse<T>(schema: z.ZodType<T>, value: unknown): T { const result = schema.safeParse(value); if (!result.success) throw new BadRequestException(result.error.issues.map(issue => issue.message).join(' ')); return result.data; }
@ApiTags('Operações escolares') @ApiBearerAuth() @Controller('api/v1/operations') @UseGuards(AccessGuard)
export class OperationsController {
  constructor(private readonly operations: OperationsService) {}
  @Get() overview(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) { res.setHeader('Cache-Control', 'no-store'); return this.operations.overview(req.principal); }
  @Post('requirements') requirement(@Req() req: AuthRequest, @Body() body: unknown) { return this.operations.createRequirement(req.principal, body); }
  @Post('documents') upload(@Req() req: AuthRequest, @Body() body: unknown) { return this.operations.uploadDocument(req.principal, body); }
  @Put('documents/:id') review(@Req() req: AuthRequest, @Param('id') id: string, @Body() body: unknown) { return this.operations.reviewDocument(req.principal, parse(z.uuid(), id), body); }
  @Put('enrollments/:id/completion') completion(@Req() req: AuthRequest, @Param('id') id: string, @Body() body: unknown) { return this.operations.setCompletion(req.principal, parse(z.uuid(), id), body); }
  @Post('transitions') transition(@Req() req: AuthRequest, @Body() body: unknown): Promise<unknown> { return this.operations.transition(req.principal, body); }
  @Post('kits') kit(@Req() req: AuthRequest, @Body() body: unknown) { return this.operations.createKit(req.principal, body); }
  @Post('items') item(@Req() req: AuthRequest, @Body() body: unknown): Promise<unknown> { return this.operations.createItem(req.principal, body); }
  @Post('orders') order(@Req() req: AuthRequest, @Body() body: unknown): Promise<unknown> { return this.operations.saveOrder(req.principal, body); }
  @Post('reports') report(@Req() req: AuthRequest, @Body() body: unknown) { if (req.principal.user.role !== 'DIRECTOR') throw new ForbiddenException('Relatórios gerenciais são restritos à Direção.'); return this.operations.report(req.principal, body); }
  @Get('readiness') readiness(@Req() req: AuthRequest) { return this.operations.readiness(req.principal); }
}
