import { ForbiddenException } from "@nestjs/common";
import { Injectable } from "@nestjs/common/decorators";
import { CanActivate, ExecutionContext } from "@nestjs/common/interfaces";
import { Reflector } from "@nestjs/core";
import { AuthErrors } from "../auth/auth.i18n";
import { AuthedRequest } from "../auth/types";
import { UserRoles } from "../user/user.entity";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest<AuthedRequest>();
    if (requiredRoles.includes(user.role)) return true;
    else throw new ForbiddenException(AuthErrors.access_denied, `Недостаточно прав, текущая роль - ${user.role}, необходима (ы) - ${requiredRoles}`);
  }
}
