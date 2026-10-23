import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { readConfig } from './config.js';
import { ProblemFilter } from './problem.filter.js';
async function bootstrap() {
  const config = readConfig(process.env);
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.useGlobalFilters(new ProblemFilter());
  app.enableCors({ origin: config.WEB_ORIGIN, credentials: true });
  app.enableShutdownHooks();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app,
    new DocumentBuilder().setTitle('SmartSchool API — MD-15').setDescription('Operações escolares, financeiro transacional, documentos privados e prontidão local. Sem Kafka, dados reais ou publicação.').addBearerAuth().setVersion('0.15.0').build()));
  await app.listen(config.API_PORT, '0.0.0.0');
}
bootstrap().catch(() => { console.error('API não iniciou. Verifique a configuração e os logs locais.'); process.exitCode = 1; });
