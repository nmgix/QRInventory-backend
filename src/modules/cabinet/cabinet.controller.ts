import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseFilters, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GlobalException } from "src/helpers/GlobalException";
import { Cabinet, CreateCabinetDTO, EditCabinetDTO } from "./cabinet.entity";
import { CabinetErrors } from "./cabinet.i18n";
import { CabinetService } from "./cabinet.service";
import { CabinetSwagger } from "./cabinet.docs";

@ApiTags(CabinetSwagger.tag)
@Controller("cabinet")
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new GlobalException(CabinetErrors.cabinet_input_data_error, CabinetErrors.cabinet_input_data_error))
export class CabinetController {
  constructor(private cabinerService: CabinetService) {}

  @Get()
  @ApiOperation({ summary: "Получение всех кабинетов" })
  @ApiResponse({ status: 200, description: "Найденные кабинеты (со всеми найденными в БД учителями и предметами)", type: [Cabinet] })
  async getAllCabinets() {
    return await this.cabinerService.getAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Поиск кабинета по id" })
  @ApiResponse({ status: 200, description: "Найденный кабинет (со всеми найденными в БД учителями и предметами)", type: Cabinet })
  async getCabinetData(@Param("id") id: string) {
    return await this.cabinerService.get(id);
  }

  @Post("create")
  @ApiOperation({ summary: "Создание кабинета, необходим номер кабинета, опционально предметы и учителя" })
  @ApiResponse({ status: 200, description: "Созданный кабинет (со всеми найденными в БД учителями и предметами)", type: Cabinet })
  async createCabinet(@Body() dto: CreateCabinetDTO) {
    const cabinet = await this.cabinerService.create(dto);
    return await this.cabinerService.get(cabinet.id);
  }

  @Put("edit")
  @ApiOperation({ summary: "Изменение кабинета, переписывается всё кроме id" })
  @ApiResponse({ status: 200, description: "Изменённый кабинет", type: Cabinet })
  async editCabinet(@Body() dto: EditCabinetDTO) {
    const cabinet = await this.cabinerService.update(dto);
    if (!cabinet) {
      return {
        message: CabinetErrors.cabinet_not_found
      };
    } else {
      return cabinet;
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удаление кабинета по id" })
  @ApiResponse({ status: 200, description: "Статус удален ли кабинет или не найден" })
  async deleteCabinet(@Param("id") id: string) {
    const result = await this.cabinerService.delete(id);

    return {
      message: CabinetErrors[result.affected > 0 ? "cabinet_deleted" : "cabinet_not_found"]
    };
  }
}
