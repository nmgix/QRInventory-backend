import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "./auth.decorator";
import { AuthErrors } from "./auth.i18n";
import { UserRequestData, Tokens } from "./types";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private configService: ConfigService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new ForbiddenException(AuthErrors.access_denied);
    try {
      const payload: UserRequestData = await this.jwtService.verifyAsync(token, { secret: this.configService.get("JWT_ACCESS_SECRET") });
      request.user = payload;
    } catch (e) {
      throw new ForbiddenException(AuthErrors.access_denied);
    }
    return false;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    return request.signedCookies[Tokens.access_token] ?? "";
  }
}
