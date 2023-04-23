import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import swaggerSetup from "./documentation/swaggerSetup";
import appSetup from "./modules/app/app.setup";
import { NodeENV } from "./helpers/types";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  if (process.env.NODE_ENV !== NodeENV.prod) {
    swaggerSetup(app);
  }
  await appSetup(app);
}
bootstrap();
