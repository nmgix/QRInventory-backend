import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, Req, UseFilters } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InstitutionSwagger } from "../../documentation/institution.docs";
import { GlobalException } from "../../helpers/global.exceptions";
import { AuthedRequest } from "../auth/types";
import { Roles } from "../roles/roles.decorator";
import { UserRoles } from "../user/user.entity";
import { CreateInstitutionDTO, EditInstitutionDTO, Institution } from "./institution.entity";
import { InstitutionErrors } from "./institution.i18n";
import { InstitutionService } from "./institution.service";

@ApiTags(InstitutionSwagger.tag)
@Controller("institution")
@UseFilters(new GlobalException(InstitutionErrors.institution_input_error, InstitutionErrors.institution_input_error, InstitutionErrors.institution_not_found))
@Roles(UserRoles.ADMIN)
export class InstitutionController {
  constructor(private institutionService: InstitutionService) {}

  @Get("all")
  @HttpCode(200)
  @ApiOperation({ summary: "Получение всех привязанных учреждений" })
  @ApiResponse({ status: 200, description: "Привязанные учреждения", type: [Institution] })
  @ApiQuery({ name: "take", required: false, description: "Сколько записей взять" })
  @ApiQuery({ name: "skip", required: false, description: "Сколько записей пропустить" })
  async getInstitutions(@Req() req: AuthedRequest, @Query() { take, skip }) {
    const [data, total] = await this.institutionService.getAdminInstitutions(req.user.id, take, skip);
    return {
      institutions: data,
      total
    };
  }

  @Get(":id")
  @HttpCode(200)
  @ApiOperation({ summary: "Получение привязанного учреждения по id" })
  @ApiResponse({ status: 200, description: "Привязанное учреждение", type: Institution })
  async getInstitutionById(@Req() req: AuthedRequest, @Param("id") id: string) {
    return this.institutionService.getInstitutionById(req.user.id, id);
  }

  @ApiOperation({ summary: "Создание нового учреждения" })
  @ApiResponse({ status: 200, description: "Привязанное учреждение", type: Institution })
  @Post("create")
  async createInstitution(@Req() req: AuthedRequest, @Body() dto: CreateInstitutionDTO) {
    const createdInstitution = await this.institutionService.createInstitution(req.user.id, dto);
    return { ...createdInstitution, cabinets: createdInstitution.cabinets.length, items: createdInstitution.items.length, teachers: createdInstitution.teachers.length };
  }

  @ApiOperation({ summary: "Изменение учреждения" })
  @ApiResponse({ status: 200, description: "Изменённый кабинет", type: Institution })
  @Patch("edit")
  async editInstitution(@Req() req: AuthedRequest, @Body() dto: EditInstitutionDTO) {
    return this.institutionService.editInstitution(req.user.id, dto);
  }

  // @ApiOperation({ summary: "Удаление учреждения по id" })
  // @ApiResponse({ status: 200, description: "Статус удалено ли учреждение или не найдено" })
  // @Delete(":id")
  // async deleteInstitution(@Req() req: AuthedRequest, @Param("id") id: string) {
  //   const result = await this.institutionService.deleteInstitution(req.user.id, id);
  //   return {
  //     message: result.affected > 0 ? InstitutionMessages.institution_deleted : InstitutionErrors.institution_not_found
  //   };
  // }
}
