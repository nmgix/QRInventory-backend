import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { CabinetSwagger } from "../modules/cabinet/cabinet.docs";
import { ItemSwagger } from "../modules/item/item.docs";
import { UserSwagger } from "../modules/user/user.docs";

enum SwaggerData {
  api_name = "Апи инвентаризации колледжа",
  api_description = "Бекенд часть проекта инвентаризации колледжа, данные хранятся в Postgres, приложение написано на Nest.JS",
  api_version = "1.0",
  sagger_title = "Документация к API инвентаризации"
}

const config = new DocumentBuilder()
  .setTitle(SwaggerData.api_name)
  .setDescription(SwaggerData.api_description)
  .setVersion(SwaggerData.api_version)
  .addTag(CabinetSwagger.tag, CabinetSwagger.description)
  .addTag(UserSwagger.tag, UserSwagger.description)
  .addTag(ItemSwagger.tag, ItemSwagger.description)
  .build();

export default function swaggerSetup(app: INestApplication) {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    customSiteTitle: SwaggerData.sagger_title
  });
}
