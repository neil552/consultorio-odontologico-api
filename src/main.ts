import { NestFactory } from '@nestjs/core';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const validationMessages: Record<string, string> = {
  isNotEmpty: 'es obligatorio',
  isEmail: 'debe ser un correo electrónico válido',
  isString: 'debe ser texto',
  isInt: 'debe ser un número entero',
  isNumber: 'debe ser un número',
  isBoolean: 'debe ser verdadero o falso',
  isDateString: 'debe ser una fecha válida en formato ISO 8601',
  isEnum: 'contiene un valor no válido',
  min: 'es menor al valor mínimo permitido',
  minLength: 'no tiene la longitud mínima requerida',
  maxLength: 'supera la longitud máxima permitida',
  whitelistValidation: 'contiene una propiedad no permitida',
};

function translateValidationErrors(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const constraints = error.constraints ?? {};
    const messages = Object.keys(constraints).map(
      (constraint) =>
        `${error.property} ${validationMessages[constraint] ?? 'no es válido'}`,
    );
    const childMessages = error.children?.length
      ? translateValidationErrors(error.children)
      : [];
    return [...messages, ...childMessages];
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException(translateValidationErrors(errors)),
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('API Consultorio Odontológico')
    .setDescription('Gestión clínica y administrativa del consultorio')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
