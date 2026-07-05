import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

/**
 * Bootstraps the SmartLedger NestJS API with security, validation, and Swagger.
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const corsOrigin = configService.get<string>('app.corsOrigin', 'http://localhost:5173');
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');

  app.setGlobalPrefix(apiPrefix);

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SmartLedger API')
    .setDescription(
      'Digital Ledger, Business Health Tracker & Credit Readiness Platform for Rwandan MSMEs',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Health', 'Platform liveness and readiness probes')
    .addTag('Auth', 'Authentication and authorization')
    .addTag('Businesses', 'Business profile and onboarding')
    .addTag('Dashboard', 'Dashboard aggregations')
    .addTag('Transactions', 'Transaction management')
    .addTag('Customers', 'Customer management')
    .addTag('Suppliers', 'Supplier management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);

  logger.log(`SmartLedger API running on http://localhost:${port}/${apiPrefix}`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
  logger.log(`Environment: ${nodeEnv}`);
}

bootstrap();
