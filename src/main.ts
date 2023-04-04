import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { formatErrorPipe } from './helpers/formatErrors';
// import * as csurf from 'csurf';
import { rateLimit } from 'express-rate-limit';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  // app.use(csurf());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    }),
  );
  // пока до прокси ещё далеко
  // app.set('trust proxy', 1);

  app.useGlobalPipes(formatErrorPipe);

  await app.listen(3000);
}
bootstrap();
