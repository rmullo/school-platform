import { ArgumentsHost, Catch, HttpException, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class ProblemFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = error instanceof HttpException ? error.getStatus() : 500;
    response.status(status).type('application/problem+json').json({
      type: 'about:blank',
      title: status === 404 ? 'Recurso não encontrado' : 'Não foi possível concluir a solicitação',
      status,
      detail: status < 500 ? 'Verifique o endereço e os dados da solicitação.' : 'Tente novamente ou consulte os logs locais com o identificador da solicitação.',
      correlationId: response.getHeader('x-correlation-id'),
    });
  }
}
