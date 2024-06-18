import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: configService.get('CORS_CLIENT_URL'),
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const documentConfig = new DocumentBuilder()
    .setTitle('Asset Management APIs')
    .setDescription('This document is only available in development mode')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.get('PORT'));
}
bootstrap();
