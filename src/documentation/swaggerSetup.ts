import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Tokens } from "../modules/auth/types";

import { AuthSwagger } from "./auth.docs";
import { CabinetSwagger } from "./cabinet.docs";
import { ItemSwagger } from "./item.docs";
import { UserSwagger } from "./user.docs";

enum SwaggerData {
  api_name = "Апи инвентаризации колледжа",
  api_description = "Бекенд часть проекта инвентаризации колледжа, данные хранятся в Postgres, приложение написано на Nest.JS",
  api_version = "1.0",
  swagger_title = "Документация к API инвентаризации"
}

const config = new DocumentBuilder()
  .setTitle(SwaggerData.api_name)
  .setDescription(SwaggerData.api_description)
  .setVersion(SwaggerData.api_version)
  .addTag(AuthSwagger.tag, AuthSwagger.description)
  .addTag(UserSwagger.tag, UserSwagger.description)
  .addTag(CabinetSwagger.tag, CabinetSwagger.description)
  .addTag(ItemSwagger.tag, ItemSwagger.description)
  .addCookieAuth(Tokens.access_token, { type: "apiKey", name: "Основной токен доступа", description: `Живёт 30 минут, после чего кука удаляется` }, Tokens.access_token)
  .addCookieAuth(Tokens.refresh_token, { type: "apiKey", name: "Рефреш токен доступа", description: `Живёт 7 дней, после чего кука удаляется. Если кука не удалилась, используется для получения новой пары токенов в любом запросе` }, Tokens.refresh_token)
  .addServer(`http://localhost:${process.env.APP_PORT}`)
  .addServer(`http://localhost:${process.env.GLOBAL_PORT}`)
  .build();

export default function swaggerSetup(app: INestApplication) {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    customSiteTitle: SwaggerData.swagger_title
  });
}
