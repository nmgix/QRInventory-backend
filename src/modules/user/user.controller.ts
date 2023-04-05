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
} from '@nestjs/common';
import { UserDTO } from './user.entity';
import { UserErrors } from './user.i18n';
import { UserService } from './user.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('all')
  async getAllTeacher() {
    return await this.userService.getAllTeachers();
  }

  @Get(':id')
  async getTeacher(@Param('id') id: string) {
    return await this.userService.find(id);
  }

  @Post('create')
  async createTeacher(@Body() dto: UserDTO) {
    return await this.userService.create(dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async deleteTeacher(@Param('id') id: string) {
    const deleteResult = await this.userService.delete(id).catch((err) => {
      // вот это недоразумение в дальнейшем исправить
      throw new HttpException(
        { message: UserErrors.user_not_found },
        HttpStatus.BAD_REQUEST,
      );
    });

    return {
      message:
        UserErrors[
          deleteResult.affected === 0 ? 'user_not_found' : 'user_deleted'
        ],
    };
  }
}
