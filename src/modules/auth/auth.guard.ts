import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { NodeENV } from "../../helpers/types";
import { IS_PUBLIC_KEY } from "./auth.decorator";
import { AuthErrors } from "./auth.i18n";
import { AuthService } from "./auth.service";
import { UserRequestData, Tokens } from "./types";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private configService: ConfigService, private reflector: Reflector, private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse<Response>();
    let tokens = this.extractTokenFromHeader(request);
    if (!tokens.accessToken) {
      if (!tokens.refreshToken) throw new ForbiddenException(AuthErrors.access_denied, `В куки нет токенов`);
      const { id } = await this.jwtService.verifyAsync(tokens.refreshToken, { secret: this.configService.get("JWT_ACCESS_SECRET") });

      tokens = await this.authService.refreshTokens(id, tokens.refreshToken);
      res.cookie(Tokens.access_token, tokens.accessToken, { signed: true, httpOnly: true, maxAge: +process.env.ACCESS_TIMEOUT * 1000, sameSite: this.configService.get("NODE_ENV") === NodeENV.prod ? "strict" : "lax", secure: this.configService.get("NODE_ENV") === NodeENV.prod });
      res.cookie(Tokens.refresh_token, tokens.refreshToken, { signed: true, httpOnly: true, maxAge: +process.env.REFRESH_TIMEOUT * 1000, sameSite: this.configService.get("NODE_ENV") === NodeENV.prod ? "strict" : "lax", secure: this.configService.get("NODE_ENV") === NodeENV.prod });
    }
    try {
      const payload: UserRequestData = await this.jwtService.verifyAsync(tokens.accessToken, { secret: this.configService.get("JWT_ACCESS_SECRET") });
      request.user = payload;
      return true;
    } catch (e) {
      throw new ForbiddenException(AuthErrors.access_denied, `Произошла ошибка при сверке access-токена`);
    }
  }

  private extractTokenFromHeader(request: Request) {
    const accessToken = request.signedCookies[Tokens.access_token];
    const refreshToken = request.signedCookies[Tokens.refresh_token];

    return { accessToken, refreshToken };
  }
}
