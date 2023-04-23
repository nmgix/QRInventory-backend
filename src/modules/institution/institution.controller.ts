import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseFilters, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InstitutionSwagger } from "../../documentation/institution.docs";
import { GlobalException } from "../../helpers/global.exceptions";
import { Public } from "../auth/auth.decorator";
import { AuthedRequest } from "../auth/types";
import { Roles } from "../roles/roles.decorator";
import { UserRoles } from "../user/user.entity";
import { CreateInstitutionDTO, EditInstitutionDTO, Institution } from "./institution.entity";
import { InstitutionErrors, InstitutionMessages } from "./institution.i18n";
import { InstitutionService } from "./institution.service";

@ApiTags(InstitutionSwagger.tag)
@Controller("institution")
@UseFilters(new GlobalException(InstitutionErrors.institution_input_error, InstitutionErrors.institution_input_error, InstitutionErrors.institution_not_found))
@Roles(UserRoles.ADMIN)
export class InstitutionController {
  constructor(private institutionService: InstitutionService) {}

  @ApiOperation({ summary: "Получение всех привязанных учреждений" })
  @ApiResponse({ status: 200, description: "Привязанные учреждения", type: [Institution] })
  @ApiQuery({ required: false, name: "full", description: "Подгрузить все данные по учреждению (все кабинеты)", type: Boolean })
  @Get("all")
  @HttpCode(200)
  async getInstitutions(@Req() req: AuthedRequest, @Query("full") full: string) {
    return this.institutionService.getAdminInstitutions(req.user.id, Boolean(full));
  }

  @ApiOperation({ summary: "Получение привязанного учреждения по id" })
  @ApiResponse({ status: 200, description: "Привязанное учреждение", type: Institution })
  @ApiQuery({ required: false, name: "full", description: "Подгрузить все данные по учреждению (все кабинеты)", type: Boolean })
  @Get(":id")
  @HttpCode(200)
  async getInstitutionById(@Req() req: AuthedRequest, @Param("id") id: string, @Query("full") full: string) {
    return this.institutionService.getInstitutionById(req.user.id, id, Boolean(full));
  }

  @ApiOperation({ summary: "Создание нового учреждения" })
  @ApiResponse({ status: 200, description: "Привязанное учреждение", type: Institution })
  @Post("create")
  async createInstitution(@Req() req: AuthedRequest, @Body() dto: CreateInstitutionDTO) {
    return this.institutionService.createInstitution(req.user.id, dto);
  }

  @ApiOperation({ summary: "Изменение учреждения" })
  @ApiResponse({ status: 200, description: "Изменённый кабинет", type: Institution })
  @Patch("edit")
  async editInstitution(@Req() req: AuthedRequest, @Body() dto: EditInstitutionDTO) {
    return this.institutionService.editInstitution(req.user.id, dto);
  }

  @ApiOperation({ summary: "Удаление учреждения по id" })
  @ApiResponse({ status: 200, description: "Статус удалено ли учреждение или не найдено" })
  @Delete(":id")
  async deleteInstitution(@Req() req: AuthedRequest, @Param("id") id: string) {
    const result = await this.institutionService.deleteInstitution(req.user.id, id);
    return {
      message: result.affected > 0 ? InstitutionMessages.institution_deleted : InstitutionErrors.institution_not_found
    };
  }
}
