import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseFilters
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GlobalException } from "../../helpers/global.exceptions";
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

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Get("all")
  @ApiOperation({ summary: "Получение всех кабинетов" })
  @ApiResponse({ status: 200, description: "Найденные кабинеты (со всеми найденными в БД учителями и предметами)", type: [Cabinet] })
  @ApiQuery({ name: "take", required: false, description: "Сколько записей взять" })
  @ApiQuery({ name: "skip", required: false, description: "Сколько записей пропустить" })
  @HttpCode(200)
  async getAllCabinets(@Req() req: AuthedRequest, @Query() { take, skip }, @Query("institution") institution: string) {
    const [data, total] =
      req.user.role === UserRoles.ADMIN
        ? await this.cabinetService.getAdminAll(req.user.id, institution, take, skip)
        : await this.cabinetService.getTeacherAll(req.user.id, institution, take, skip);
    return {
      cabinets: data,
      total
    };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Поиск кабинета по id либо номеру" })
  @ApiQuery({ name: "cabinet", description: "Номер кабинета", required: false, type: String })
  @ApiQuery({ name: "institution", description: "id учреждения", required: false })
  @ApiQuery({ name: "id", description: "Id кабинета", required: false })
  @ApiQuery({ name: "take", required: false, description: "Сколько записей взять" })
  @ApiQuery({ name: "skip", required: false, description: "Сколько записей пропустить" })
  @ApiResponse({ status: 200, description: "Найденный кабинет (со всеми найденными в БД учителями и предметами)", type: Cabinet })
  @HttpCode(200)
  async findCabinets(
    @Query() { take, skip },
    @Query("institution") institution?: string,
    @Query("id") id?: string,
    @Query("cabinet") cabinet?: string
  ) {
    const [data, total] = await this.cabinetService.get(institution, take, skip, id, cabinet);
    if (id) {
      return data[0];
    } else {
      return {
        cabinets: data,
        total
      };
    }
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Post("create")
  @ApiOperation({ summary: "Создание кабинета, необходим номер кабинета, опционально предметы и учителя" })
  @ApiResponse({ status: 201, description: "Созданный кабинет (со всеми найденными в БД учителями и предметами)", type: Cabinet })
  @HttpCode(200)
  async createCabinet(@Req() req: AuthedRequest, @Body() dto: CreateCabinetDTO) {
    // здесь привязывать к колледжу
    const cabinet = await this.cabinetService.create(req.user.id, {
      ...dto,
      teachers: req.user.role !== UserRoles.ADMIN ? [String(req.user.id)] : dto.teachers
    });
    const [data, total] = await this.cabinetService.get(dto.institution, undefined, undefined, cabinet.id);
    return data[0];
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Patch("edit")
  @ApiOperation({ summary: "Изменение кабинета, учителя передавать в массиве учителей не надо" })
  @ApiResponse({ status: 200, description: "Изменённый кабинет", type: Cabinet })
  @HttpCode(200)
  async editCabinet(@Req() req: AuthedRequest, @Body() dto: EditCabinetDTO) {
    const [data, total] = await this.cabinetService.get(undefined, undefined, undefined, dto.id);
    const cabinet = data[0];
    if (!cabinet) throw new BadRequestException(CabinetErrors.cabinet_not_found);
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
    const [data, total] = await this.cabinetService.get(undefined, undefined, undefined, id);
    const cabinet = data[0];
    if ((req.user.role === UserRoles.TEACHER && cabinet.teachers.some(teacher => teacher.id === req.user.id)) || req.user.role === UserRoles.ADMIN) {
      const result = await this.cabinetService.delete(req.user.id, id);
      return {
        message: result.affected > 0 ? CabinetMessages.cabinet_deleted : CabinetErrors.cabinet_not_found
      };
    } else {
      throw new ForbiddenException(AuthErrors.access_denied);
    }
  }
}
