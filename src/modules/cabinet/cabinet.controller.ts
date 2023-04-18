import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Delete, ForbiddenException, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post, Put, Query, Req, UseFilters, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GlobalException } from "../../helpers/GlobalException";
import { Cabinet, CreateCabinetDTO, EditCabinetDTO } from "./cabinet.entity";
import { CabinetErrors, CabinetMessages } from "./cabinet.i18n";
import { CabinetService } from "./cabinet.service";
import { CabinetSwagger } from "../../documentation/cabinet.docs";
import { Roles } from "../roles/roles.decorator";
import { UserRoles } from "../user/user.entity";
import { AuthedRequest } from "../auth/types";
import { Public } from "../auth/auth.decorator";
import { AuthErrors } from "../auth/auth.i18n";

@ApiTags(CabinetSwagger.tag)
@Controller("cabinet")
@UseFilters(new GlobalException(CabinetErrors.cabinet_input_data_error, CabinetErrors.cabinet_input_data_error, CabinetErrors.cabinet_not_found))
export class CabinetController {
  constructor(private cabinetService: CabinetService) {}

  @Roles(UserRoles.ADMIN)
  @Get("all")
  @ApiOperation({ summary: "Получение всех кабинетов" })
  @ApiResponse({ status: 200, description: "Найденные кабинеты (со всеми найденными в БД учителями и предметами)", type: [Cabinet] })
  @HttpCode(200)
  async getAllCabinets(@Req() req: AuthedRequest) {
    return this.cabinetService.getAll(req.user.id);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Поиск кабинета по id" })
  @ApiQuery({ name: "id", description: "Id кабинета", required: false })
  @ApiQuery({ name: "cabinet", description: "Номер кабинета", required: false, type: String })
  @ApiResponse({ status: 200, description: "Найденный кабинет (со всеми найденными в БД учителями и предметами)", type: Cabinet })
  @HttpCode(200)
  async getCabinetData(@Query("id") id?: string, @Query("cabinet") cabinet?: string) {
    return this.cabinetService.get(id, cabinet);
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Post("create")
  @ApiOperation({ summary: "Создание кабинета, необходим номер кабинета, опционально предметы и учителя" })
  @ApiResponse({ status: 201, description: "Созданный кабинет (со всеми найденными в БД учителями и предметами)", type: Cabinet })
  @HttpCode(201)
  async createCabinet(@Req() req: AuthedRequest, @Body() dto: CreateCabinetDTO) {
    const cabinet = await this.cabinetService.create(req.user.id, { ...dto, teachers: req.user.role !== UserRoles.ADMIN ? [String(req.user.id)] : [] });
    return this.cabinetService.get(cabinet.id);
  }

  // администратор или только учитель относящийся к своему кабинету
  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Post("edit")
  @ApiOperation({ summary: "Изменение кабинета, учителя передавать в массиве учителей не надо" })
  @ApiResponse({ status: 200, description: "Изменённый кабинет", type: Cabinet })
  @HttpCode(200)
  async editCabinet(@Req() req: AuthedRequest, @Body() dto: EditCabinetDTO) {
    const cabinet = await this.cabinetService.get(dto.id);
    // console.log(cabinet);
    if (!cabinet) throw new BadRequestException(CabinetErrors.cabinet_not_found);

    // сырая имплементация, лучше потом уберу роли и оставлю про по правам изменения, #PoliciesGuard https://docs-nestjs.netlify.app/security/authorization
    if ((req.user.role === UserRoles.TEACHER && cabinet.teachers.some(teacher => teacher.id === req.user.id)) || req.user.role === UserRoles.ADMIN) {
      if (req.user.role === UserRoles.TEACHER) {
        const userInTeachers = dto.teachers?.find(teacherId => teacherId === req.user.id);
        const teachers = dto.teachers ? (userInTeachers ? dto.teachers : [...dto.teachers, req.user.id]) : undefined;
        return this.cabinetService.update(req.user.id, { ...dto, teachers });
      } else if (req.user.role === UserRoles.ADMIN) {
        const teachers = dto.teachers?.filter(teacherId => teacherId !== req.user.id);
        return this.cabinetService.update(req.user.id, { ...dto, teachers });
      } else {
        throw new ForbiddenException(AuthErrors.access_denied);
      }
    } else {
      throw new ForbiddenException(AuthErrors.access_denied);
    }
  }

  // администратор или только учитель относящийся к своему кабинету
  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Delete(":id")
  @ApiOperation({ summary: "Удаление кабинета по id" })
  @ApiResponse({ status: 200, description: "Статус удален ли кабинет или не найден" })
  @HttpCode(200)
  async deleteCabinet(@Req() req: AuthedRequest, @Param("id") id: string) {
    const cabinet = await this.cabinetService.get(id);
    if ((req.user.role === UserRoles.TEACHER && cabinet.teachers.some(teacher => teacher.id === req.user.id)) || req.user.role === UserRoles.ADMIN) {
      const result = await this.cabinetService.delete(id);
      return {
        message: result.affected > 0 ? CabinetMessages.cabinet_deleted : CabinetErrors.cabinet_not_found
      };
    } else {
      throw new ForbiddenException(AuthErrors.access_denied);
    }
  }
}
