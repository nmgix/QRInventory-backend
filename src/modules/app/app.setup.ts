import rateLimit from "express-rate-limit";
import { formatErrorPipe } from "../../helpers/formatErrors";
import * as cookieParser from "cookie-parser";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../roles/roles.guard";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../auth/auth.service";
import { ClassSerializerInterceptor } from "@nestjs/common";
import { NodeENV } from "helpers/types";

export default async function appSetup(app: NestExpressApplication) {
  const configService: ConfigService = app.get(ConfigService);
  const jwtService: JwtService = app.get(JwtService);
  const authService: AuthService = app.get(AuthService);
  const reflector = new Reflector();
  app.enableCors({ credentials: true, origin: true, methods: "GET, POST, DELETE, HEAD, OPTIONS" });
  if (process.env.NODE_ENV === NodeENV.prod) {
    app.use(rateLimit({ windowMs: 60 * 1000, max: 50 }));
  }
  app.use(cookieParser(configService.get("JWT_COOKIE")));
  app.useGlobalPipes(formatErrorPipe);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  app.useGlobalGuards(new AuthGuard(jwtService, configService, reflector, authService), new RolesGuard(reflector));
  await app.listen(configService.get("APP_PORT"));
}
