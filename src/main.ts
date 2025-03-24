import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer, ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const response = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: {},
          errors: HttpStatus[HttpStatus.BAD_REQUEST],
        };

        errors.forEach((error: ValidationError) => {
          const field = error.property;
          const errorList = Object.values(error.constraints);
          response.message[field] = errorList;
        });

        return response;
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Integrations')
    .setDescription('API Integration documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
