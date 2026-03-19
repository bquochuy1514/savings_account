import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // automatically transform payload to DTO types
      whitelist: true, // remove properties that are not in the DTO
      forbidNonWhitelisted: true, // throw error if extra properties are sent
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor(new Reflector()));
  app.setGlobalPrefix('api', { exclude: ['/'] });

  await app.listen(process.env.PORT || 8080);
}

// 1. SavingsBook Module (BM1 - mở sổ)
// 2. Transaction Module (BM2 - gởi thêm)
// 3. Transaction Module (BM3 - rút tiền, logic tính lãi)
// 4. BM4, BM5

bootstrap();
