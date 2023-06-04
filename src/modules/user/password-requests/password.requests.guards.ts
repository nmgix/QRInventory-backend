import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger
} from "@nestjs/common";
import { AuthedRequest } from "modules/auth/types";
import { InstitutionErrors } from "modules/institution/institution.i18n";
import { InstitutionService } from "modules/institution/institution.service";

@Injectable()
export class AdminInstitutionGuard implements CanActivate {
  constructor(private institutionService: InstitutionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: AuthedRequest = context.switchToHttp().getRequest();
      let [data, total] = await this.institutionService.getAdminInstitutions(request.user.id, 1, 0);
      return data.length === 1;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(InstitutionErrors.institution_not_found);
    }
  }
}

@Injectable()
export class InstitutionExistsGuard implements CanActivate {
  constructor(private institutionService: InstitutionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: AuthedRequest = context.switchToHttp().getRequest();
      const params = request.params;
      const exists = await this.institutionService.institutionExists(params.institutionId);
      return exists;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(InstitutionErrors.institution_not_found);
    }
  }
}
