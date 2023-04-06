import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { formatErrorPipe } from './helpers/formatErrors';
// import * as csurf from 'csurf';
// import csrf from 'csrf'
import { rateLimit } from 'express-rate-limit';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UserSwagger } from './modules/user/user.docs';
import { ItemSwagger } from './modules/item/item.docs';
import { CabinetSwagger } from './modules/cabinet/cabinet.docs';

enum SwaggerData {
  api_name = 'Апи инвентаризации колледжа',
  api_description = 'Бекенд часть проекта инвентаризации колледжа, данные хранятся в Postgres, приложение написано на Nest.JS',
  api_version = '1.0',
  sagger_title = 'Документация к API инвентаризации',
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  // app.use(csurf());
  // app.use(csrf())
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    }),
  );
  // пока до прокси ещё далеко
  // app.set('trust proxy', 1);
  app.useGlobalPipes(formatErrorPipe);

  const config = new DocumentBuilder()
    .setTitle(SwaggerData.api_name)
    .setDescription(SwaggerData.api_description)
    .setVersion(SwaggerData.api_version)
    .addTag(CabinetSwagger.tag, CabinetSwagger.description)
    .addTag(UserSwagger.tag, UserSwagger.description)
    .addTag(ItemSwagger.tag, ItemSwagger.description)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: SwaggerData.sagger_title,
  });

  await app.listen(3000);
}
bootstrap();
