import rateLimit from "express-rate-limit";
import { formatErrorPipe } from "./formatErrors";
import * as cookieParser from "cookie-parser";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { nestCsrf, CsrfFilter } from "ncsrf";

export default async function appSetup(app: NestExpressApplication) {
  const configService: ConfigService = app.get(ConfigService);
  app.enableCors();
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
  app.use(cookieParser(configService.get("JWT_COOKIE")));
  // app.use(nestCsrf({ signed: true }));
  // app.useGlobalFilters(new CsrfFilter()); // вот это исправить, там есть два exception'а, https://www.skypack.dev/view/ncsrf, их можно обработать кастомным pipe со своими текстами ошибок
  // app.set("trust proxy", 1);
  app.useGlobalPipes(formatErrorPipe);
  await app.listen(configService.get("APP_PORT"));
}
