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
import { GlobalException } from 'src/helpers/GlobalException';
import { Cabinet, CreateCabinetDTO, EditCabinetDTO } from './cabinet.entity';
import { CabinetErrors } from './cabinet.i18n';
import { CabinetService } from './cabinet.service';

@Controller('cabinet')
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new GlobalException(CabinetErrors.cabinet_edit_error))
export class CabinetController {
  constructor(private cabinerService: CabinetService) {}

  @Get()
  async getAllCabinets() {
    return await this.cabinerService.getAll();
  }

  @Get(':id')
  async getCabinetData(@Param('id') id: string) {
    return await this.cabinerService.get(id);
  }

  @Post('create')
  async createCabinet(@Body() dto: CreateCabinetDTO) {
    const cabinet = await this.cabinerService.create(dto);
    return await this.cabinerService.get(cabinet.id);
  }

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
