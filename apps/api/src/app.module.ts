import { Controller, Get, Module, Res, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { AccessService, type Principal } from './access/access.service.js';
import { AccessGuard, AuthController, UsersController } from './access/access.controller.js';
import type { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { APP_CONFIG, readConfig } from './config.js';
import { FoundationService } from './foundation.service.js';
const config = readConfig(process.env);
@ApiTags('Ambiente')
@Controller()
class HealthController {
  constructor(private readonly foundation: FoundationService) {}
  @Get('health')
  @ApiOperation({ summary: 'Processo da API em execução' })
  health() { return { status: 'ok' }; }
  @Get('ready')
  @ApiOperation({ summary: 'Prontidão do banco e armazenamento; 503 quando indisponíveis' })
  async ready(@Res({ passthrough: true }) response: Response) {
    const status = await this.foundation.status();
    response.status(status.status === 'ready' ? 200 : 503);
    return { status: status.status, checkedAt: status.checkedAt, services: status.services };
  }
  @Get('api/v1/status')
  @UseGuards(AccessGuard)
  @ApiOperation({ summary: 'Estado da fundação local, sem dados escolares' })
  async status(@Res({ passthrough: true }) response: Response, @Req() request: { principal: Principal }) {
    if (!['DIRECTOR', 'IT'].includes(request.principal.user.role)) throw new ForbiddenException('Acesso técnico restrito.');
    response.setHeader('Cache-Control', 'no-store');
    return this.foundation.status();
  }
}
@Module({
  imports: [LoggerModule.forRoot({
    pinoHttp: {
      level: config.LOG_LEVEL,
      genReqId: (req, res) => {
        const supplied = req.headers['x-correlation-id'];
        const id = typeof supplied === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(supplied) ? supplied : randomUUID();
        res.setHeader('x-correlation-id', id);
        return id;
      },
      redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie'],
      serializers: {
        req: (req) => ({ id: req.id, method: req.method, path: typeof req.url === 'string' ? req.url.split('?')[0] : undefined }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    },
  })],
  controllers: [HealthController, AuthController, UsersController],
  providers: [{ provide: APP_CONFIG, useValue: config }, FoundationService, AccessService, AccessGuard],
})
export class AppModule {}
