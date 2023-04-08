import { Injectable } from "@nestjs/common/decorators";
import { CanActivate, ExecutionContext } from "@nestjs/common/interfaces";
import { Reflector } from "@nestjs/core";
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
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}
