import { ClassSerializerInterceptor, Controller, Get, HttpCode, Query, Req, UseFilters, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InstitutionSwagger } from "../documentation/institution.docs";
import { GlobalException } from "../helpers/GlobalException";
import { Public } from "../modules/auth/auth.decorator";
import { AuthedRequest } from "../modules/auth/types";
import { Roles } from "../modules/roles/roles.decorator";
import { UserRoles } from "../modules/user/user.entity";
import { InstitutionErrors } from "./institution.i18n";
import { InstitutionService } from "./institution.service";

@ApiTags(InstitutionSwagger.tag)
@Controller("institution")
@UseFilters(new GlobalException(InstitutionErrors.institution_input_error, InstitutionErrors.institution_input_error))
@UseInterceptors(ClassSerializerInterceptor)
export class InstitutionController {
  constructor(private institutionService: InstitutionService) {}

  @Public()
  //   @Roles(UserRoles.ADMIN)
  @Get()
  @HttpCode(200)
  async getInstitutions(@Req() req: AuthedRequest, @Query("full") full: string) {
    return this.institutionService.getAdminInstitutions(req.user.id, Boolean(full));
  }
}
