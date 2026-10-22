import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { campaignInputSchema, campaignOfferInputSchema, commercialEditSchema, contractInputSchema } from '@smartschool/contracts';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { AccessGuard } from '../access/access.controller.js';
import type { Principal } from '../access/access.service.js';
import { CommercialService } from './commercial.service.js';
type AuthRequest = Request & { principal: Principal };
function parse<T>(schema: z.ZodType<T>, value: unknown): T { const result = schema.safeParse(value); if (!result.success) throw new BadRequestException(result.error.issues.map(issue => issue.message).join(' ')); return result.data; }
@ApiTags('Campanhas e contratos') @ApiBearerAuth()
@Controller('api/v1/commercial') @UseGuards(AccessGuard)
export class CommercialController {
  constructor(private readonly commercial: CommercialService) {}
  private director(req: AuthRequest, write = false) { if (req.principal.user.role !== 'DIRECTOR') throw new ForbiddenException('Campanhas e contratos são restritos à Direção.'); if (write && (req.headers['x-smartschool-client'] !== 'web' || (req.headers.origin && req.headers.origin !== process.env.WEB_ORIGIN))) throw new ForbiddenException('Origem ou identificação do cliente inválida.'); }
  @Get() overview(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) { this.director(req); res.setHeader('Cache-Control', 'no-store'); return this.commercial.overview(); }
  @Post('campaigns') createCampaign(@Body() body: unknown, @Req() req: AuthRequest): Promise<unknown> { this.director(req, true); return this.commercial.saveCampaign(req.principal, parse(campaignInputSchema, body)); }
  @Put('campaigns/:id') updateCampaign(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest): Promise<unknown> { this.director(req, true); const edit = parse(commercialEditSchema, body); return this.commercial.saveCampaign(req.principal, parse(campaignInputSchema, edit.data), { id: parse(z.uuid(), id), version: edit.version, reason: edit.reason }); }
  @Post('contracts') createContract(@Body() body: unknown, @Req() req: AuthRequest) { this.director(req, true); return this.commercial.saveContract(req.principal, parse(contractInputSchema, body)); }
  @Put('contracts/:id') updateContract(@Param('id') id: string, @Body() body: unknown, @Req() req: AuthRequest) { this.director(req, true); const edit = parse(commercialEditSchema, body); return this.commercial.saveContract(req.principal, parse(contractInputSchema, edit.data), { id: parse(z.uuid(), id), version: edit.version, reason: edit.reason }); }
  @Post('offers') createOffer(@Body() body: unknown, @Req() req: AuthRequest) { this.director(req, true); return this.commercial.addOffer(req.principal, parse(campaignOfferInputSchema, body)); }
}
