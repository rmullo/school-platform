import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { financialInputSchema, linkEditSchema, parentageInputSchema, personEditSchema, personInputSchema, personResourceSchema, pickupInputSchema, representationInputSchema, studentInputSchema } from '@smartschool/contracts';
import { z } from 'zod';
import type { Request } from 'express';
import { AccessGuard } from '../access/access.controller.js';
import type { Principal } from '../access/access.service.js';
import { PeopleService } from './people.service.js';

type AuthRequest = Request & { principal: Principal };
function parse<T>(schema: z.ZodType<T>, value: unknown): T { const result = schema.safeParse(value); if (!result.success) throw new BadRequestException(result.error.issues.map(issue => issue.message).join(' ')); return result.data; }

@ApiTags('Pessoas e vínculos') @ApiBearerAuth()
@Controller('api/v1/people') @UseGuards(AccessGuard)
export class PeopleController {
  constructor(private readonly people: PeopleService) {}
  private staff(req: AuthRequest, write = false) {
    if (!['DIRECTOR', 'SECRETARY'].includes(req.principal.user.role)) throw new ForbiddenException('Cadastro de pessoas restrito à Direção e à Secretaria.');
    if (write && (req.headers['x-smartschool-client'] !== 'web' || (req.headers.origin && req.headers.origin !== process.env.WEB_ORIGIN))) throw new ForbiddenException('Origem ou identificação do cliente inválida.');
  }
  @Get()
  overview(@Req() req: AuthRequest) { this.staff(req); return this.people.overview(); }
  @Post()
  createPerson(@Body() body: unknown, @Req() req: AuthRequest) { this.staff(req, true); return this.people.createPerson(req.principal, parse(personInputSchema, body)); }
  @Put(':id')
  updatePerson(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest) { this.staff(req, true); return this.people.updatePerson(req.principal, parse(z.uuid(), id), parse(personEditSchema, body)); }
  @Post('students')
  createStudent(@Body() body: unknown, @Req() req: AuthRequest) { this.staff(req, true); return this.people.createStudent(req.principal, parse(studentInputSchema, body)); }
  @Post('students/:studentId/:resource')
  createLink(@Param('studentId') studentId: string, @Param('resource') resource: string, @Body() body: unknown, @Req() req: AuthRequest) { this.staff(req, true); const kind = parse(personResourceSchema, resource); const schemas = { parentage: parentageInputSchema, representation: representationInputSchema, financial: financialInputSchema, pickup: pickupInputSchema }; return this.people.createLink(req.principal, kind, parse(z.uuid(), studentId), parse(schemas[kind], body)); }
  @Put('students/:studentId/:resource/:id')
  updateLink(@Param('studentId') studentId: string, @Param('resource') resource: string, @Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest) { this.staff(req, true); const kind = parse(personResourceSchema, resource); return this.people.updateLink(req.principal, kind, parse(z.uuid(), studentId), parse(z.uuid(), id), parse(linkEditSchema, body)); }
}
