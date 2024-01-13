import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({  // might need to remove this global validation, to improve performance
    whitelist: true
  }));
  await app.listen(3001);
}
bootstrap();
