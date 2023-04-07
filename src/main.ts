import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import swaggerSetup from "./helpers/swaggerSetup";
import appSetup from "./helpers/appSetup";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  swaggerSetup(app);
  await appSetup(app);
}
bootstrap();
