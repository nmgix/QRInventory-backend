import {
  Controller,
  Body,
  Post,
  ClassSerializerInterceptor,
  UseInterceptors,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpException,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GlobalException } from 'src/helpers/GlobalException';
import { UserSwagger } from './swagger.docs';
import { User, UserDTO } from './user.entity';
import { UserErrors } from './user.i18n';
import { UserService } from './user.service';

@ApiTags(UserSwagger.tag)
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new GlobalException(UserErrors.user_data_input_error))
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({
    summary: 'Получение всех учителей',
  })
  @ApiResponse({
    status: 200,
    description: 'Все учителя',
    type: [User],
  })
  @Get('all')
  async getAllTeacher() {
    return await this.userService.getAllTeachers();
  }

  @ApiOperation({
    summary: 'Получение учителя по id',
  })
  @ApiResponse({
    status: 200,
    description: 'Учитель, найденный в БД (либо null)',
    type: User,
  })
  @Get(':id')
  async getTeacher(@Param('id') id: string) {
    return await this.userService.find(id);
  }

  @ApiOperation({
    summary: 'Создание учителя',
  })
  @ApiResponse({
    status: 200,
    description: 'Созданный учитель в БД',
    type: User,
  })
  @Post('create')
  async createTeacher(@Body() dto: UserDTO) {
    return await this.userService.create(dto);
  }

  @ApiOperation({
    summary: 'Удаление учителя',
  })
  @ApiResponse({
    status: 200,
    description: 'Статус удален ли учитель или не найден',
    type: User,
  })
  @Delete(':id')
  @HttpCode(200)
  async deleteTeacher(@Param('id') id: string) {
    const deleteResult = await this.userService.delete(id);

    return {
      message:
        UserErrors[
          deleteResult.affected === 0 ? 'user_not_found' : 'user_deleted'
        ],
    };
  }
}
