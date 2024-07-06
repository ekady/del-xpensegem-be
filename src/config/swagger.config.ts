import { NestApplication } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SwaggerSetup = (app: NestApplication) => {
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Swagger')
    .setDescription('Swagger for api XpenseGem')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
};
