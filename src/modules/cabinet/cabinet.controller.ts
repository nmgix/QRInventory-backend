import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Req, UseFilters, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GlobalException } from "../../helpers/GlobalException";
import { Cabinet, CreateCabinetDTO, EditCabinetDTO } from "./cabinet.entity";
import { CabinetErrors } from "./cabinet.i18n";
import { CabinetService } from "./cabinet.service";
import { CabinetSwagger } from "../../documentation/cabinet.docs";
import { Roles } from "../roles/roles.decorator";
import { UserRoles } from "../user/user.entity";
// import { Csrf } from "ncsrf";
import { AuthedRequest } from "../auth/types";
import { Public } from "../auth/auth.decorator";

@ApiTags(CabinetSwagger.tag)
@Controller("cabinet")
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new GlobalException(CabinetErrors.cabinet_input_data_error, CabinetErrors.cabinet_input_data_error))
export class CabinetController {
  constructor(private cabinetService: CabinetService) {}

  @Roles(UserRoles.ADMIN)
  // @Csrf()
  @Get()
  @ApiOperation({ summary: "Получение всех кабинетов" })
  @ApiResponse({ status: 200, description: "Найденные кабинеты (со всеми найденными в БД учителями и предметами)", type: [Cabinet] })
  async getAllCabinets() {
    return this.cabinetService.getAll();
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Поиск кабинета по id" })
  @ApiResponse({ status: 200, description: "Найденный кабинет (со всеми найденными в БД учителями и предметами)", type: Cabinet })
  async getCabinetData(@Param("id") id: string) {
    return this.cabinetService.get(id);
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  // @Csrf()
  @Post("create")
  @ApiOperation({ summary: "Создание кабинета, необходим номер кабинета, опционально предметы и учителя" })
  @ApiResponse({ status: 200, description: "Созданный кабинет (со всеми найденными в БД учителями и предметами)", type: Cabinet })
  async createCabinet(@Body() dto: CreateCabinetDTO) {
    const cabinet = await this.cabinetService.create(dto);
    return this.cabinetService.get(cabinet.id);
  }

  // администратор или только учитель относящийся к своему кабинету
  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  // @Csrf()
  @Post("edit")
  @ApiOperation({ summary: "Изменение кабинета" })
  @ApiResponse({ status: 200, description: "Изменённый кабинет", type: Cabinet })
  async editCabinet(@Req() req: AuthedRequest, @Body() dto: EditCabinetDTO) {
    const cabinet = await this.cabinetService.get(dto.id);
    if (!cabinet) throw new BadRequestException(CabinetErrors.cabinet_not_found);

    // сырая имплементация, лучше потом уберу роли и оставлю про по правам изменения, #PoliciesGuard https://docs-nestjs.netlify.app/security/authorization
    // либо админу добавлять и то, и другое (TEACHER и ADMIN)
    if (req.user.role === UserRoles.TEACHER && cabinet.teachers.some(teacher => teacher.id === req.user.id)) {
      return this.cabinetService.update(dto);
    }
  }

  // администратор или только учитель относящийся к своему кабинету
  @Roles(UserRoles.ADMIN)
  // @Csrf()
  @Delete(":id")
  @ApiOperation({ summary: "Удаление кабинета по id" })
  @ApiResponse({ status: 200, description: "Статус удален ли кабинет или не найден" })
  async deleteCabinet(@Param("id") id: string) {
    const result = await this.cabinetService.delete(id);

    return {
      message: CabinetErrors[result.affected > 0 ? "cabinet_deleted" : "cabinet_not_found"]
    };
  }
}
