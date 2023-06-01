import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import swaggerSetup from "./documentation/swaggerSetup";
import appSetup from "./modules/app/app.setup";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  swaggerSetup(app);
  await appSetup(app);
}
bootstrap();
