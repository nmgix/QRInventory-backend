import rateLimit from "express-rate-limit";
import { formatErrorPipe } from "../../helpers/formatErrors";
import * as cookieParser from "cookie-parser";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { nestCsrf, CsrfFilter } from "ncsrf";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../roles/roles.guard";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../auth/auth.service";

export default async function appSetup(app: NestExpressApplication) {
  const configService: ConfigService = app.get(ConfigService);
  const jwtService: JwtService = app.get(JwtService);
  const authService: AuthService = app.get(AuthService);
  const reflector = new Reflector();
  app.enableCors();
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
  app.use(cookieParser(configService.get("JWT_COOKIE")));
  app.useGlobalGuards(new AuthGuard(jwtService, configService, reflector, authService), new RolesGuard(reflector));
  // app.use(nestCsrf({ signed: true }));
  // app.useGlobalFilters(new CsrfFilter()); // вот это исправить, там есть два exception'а, https://www.skypack.dev/view/ncsrf, их можно обработать кастомным pipe со своими текстами ошибок
  // app.set("trust proxy", 1);
  app.useGlobalPipes(formatErrorPipe);
  await app.listen(configService.get("APP_PORT"));
}