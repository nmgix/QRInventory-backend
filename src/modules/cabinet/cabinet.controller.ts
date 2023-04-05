import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AddTeachersDTO, Cabinet } from './cabinet.entity';
import { CabinetService } from './cabinet.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('cabinet')
export class CabinetController {
  constructor(private cabinerService: CabinetService) {}

  @Get(':id')
  async getCabinetData(@Param('id') id: string) {
    return await this.cabinerService.get(id);
  }

  @Patch(':id')
  async editCabinetData(@Param('id') id: string, @Body() dto: any) {}

  @Post()
  async createCabinet(@Body() dto: Cabinet) {
    // создать кабинет, потом добавить учителей и вещи

    return await this.cabinerService.create(dto);
  }

  @Post('/add-teachers')
  async addTeachers(@Body() dto: AddTeachersDTO) {
    return await this.cabinerService.addTeachers(dto.teachersId, dto.cabinetId);
  }

  @Post('/remove-teachers')
  async removeTeachers(@Body() dto: AddTeachersDTO) {
    return await this.cabinerService.removeTeachers(
      dto.teachersId,
      dto.cabinetId,
    );
  }
}
