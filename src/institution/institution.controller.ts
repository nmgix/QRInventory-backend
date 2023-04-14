import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, Param, Post, Query, Req, UseFilters, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InstitutionSwagger } from "../documentation/institution.docs";
import { GlobalException } from "../helpers/GlobalException";
import { Public } from "../modules/auth/auth.decorator";
import { AuthedRequest } from "../modules/auth/types";
import { Roles } from "../modules/roles/roles.decorator";
import { UserRoles } from "../modules/user/user.entity";
import { CreateInstitutionDTO } from "./institution.entity";
import { InstitutionErrors, InstitutionMessages } from "./institution.i18n";
import { InstitutionService } from "./institution.service";

@ApiTags(InstitutionSwagger.tag)
@Controller("institution")
@UseFilters(new GlobalException(InstitutionErrors.institution_input_error, InstitutionErrors.institution_input_error, InstitutionErrors.institution_not_found))
@Roles(UserRoles.ADMIN)
export class InstitutionController {
  constructor(private institutionService: InstitutionService) {}

  @Get("all")
  @HttpCode(200)
  async getInstitutions(@Req() req: AuthedRequest, @Query("full") full: string) {
    return this.institutionService.getAdminInstitutions(req.user.id, Boolean(full));
  }

  @Get(":id")
  @HttpCode(200)
  async getInstitutionById(@Req() req: AuthedRequest, @Param("id") id: string, @Query("full") full: string) {
    return this.institutionService.getInstitutionById(req.user.id, id, Boolean(full));
  }

  @Post("create")
  async createInstitution(@Req() req: AuthedRequest, @Body() dto: CreateInstitutionDTO) {
    return this.institutionService.createInstitution(req.user.id, dto);
  }

  @Delete(":id")
  async deleteInstitution(@Req() req: AuthedRequest, @Param("id") id: string) {
    const result = await this.institutionService.deleteInstitution(req.user.id, id);
    return {
      message: result.affected > 0 ? InstitutionMessages.institution_deleted : InstitutionErrors.institution_not_found
    };
  }
}
