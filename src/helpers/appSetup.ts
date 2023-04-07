import rateLimit from "express-rate-limit";
import { formatErrorPipe } from "./formatErrors";
import * as cookieParser from "cookie-parser";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";

export default async function appSetup(app: NestExpressApplication) {
  app.enableCors();
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
  app.use(cookieParser());
  app.set("trust proxy", 1);
  app.useGlobalPipes(formatErrorPipe);
  const configService: ConfigService = app.get(ConfigService);
  await app.listen(configService.get("APP_PORT"));
}
