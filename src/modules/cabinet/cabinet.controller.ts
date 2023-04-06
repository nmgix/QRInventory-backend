import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GlobalException } from 'src/helpers/GlobalException';
import { Cabinet, CreateCabinetDTO, EditCabinetDTO } from './cabinet.entity';
import { CabinetErrors } from './cabinet.i18n';
import { CabinetService } from './cabinet.service';
import { CabinetSwagger } from './swagger.docs';

@ApiTags(CabinetSwagger.tag)
@Controller('cabinet')
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new GlobalException(CabinetErrors.cabinet_edit_error))
export class CabinetController {
  constructor(private cabinerService: CabinetService) {}

  @ApiOperation({
    summary: 'Получение всех кабинетов',
  })
  @ApiResponse({
    status: 200,
    description:
      'Найденные кабинеты (со всеми найденными в БД учителями и предметами)',
    type: [Cabinet],
  })
  @Get()
  async getAllCabinets() {
    return await this.cabinerService.getAll();
  }

  @ApiOperation({
    summary: 'Поиск кабинета по id',
  })
  @ApiResponse({
    status: 200,
    description:
      'Найденный кабинет (со всеми найденными в БД учителями и предметами)',
    type: Cabinet,
  })
  @Get(':id')
  async getCabinetData(@Param('id') id: string) {
    return await this.cabinerService.get(id);
  }

  @ApiOperation({
    summary:
      'Создание кабинета, необходим номер кабинета, опционально предметы и учителя',
  })
  @ApiResponse({
    status: 200,
    description:
      'Созданный кабинет (со всеми найденными в БД учителями и предметами)',
    type: Cabinet,
  })
  @Post('create')
  async createCabinet(@Body() dto: CreateCabinetDTO) {
    const cabinet = await this.cabinerService.create(dto);
    return await this.cabinerService.get(cabinet.id);
  }

  @ApiOperation({
    summary: 'Изменение кабинета, переписывается всё кроме id',
  })
  @ApiResponse({
    status: 200,
    description: 'Изменённый кабинет',
    type: Cabinet,
  })
  @Put('edit')
  async editCabinet(@Body() dto: EditCabinetDTO) {
    const cabinet = await this.cabinerService.update(dto);
    if (!cabinet) {
      return {
        message: CabinetErrors.cabinet_not_found,
      };
    } else {
      return cabinet;
    }
  }

  @ApiOperation({
    summary: 'Удаление кабинета по id',
  })
  @ApiResponse({
    status: 200,
    description: 'Статус удален ли кабинет или не найден',
  })
  @Delete(':id')
  async deleteCabinet(@Param('id') id: string) {
    const result = await this.cabinerService.delete(id);

    return {
      message:
        CabinetErrors[
          result.affected > 0 ? 'cabinet_deleted' : 'cabinet_not_found'
        ],
    };
  }
}
