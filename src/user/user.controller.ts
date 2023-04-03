import {
  Controller,
  Body,
  Post,
  ClassSerializerInterceptor,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { UserDTO } from './user.entity';
import { UserService } from './user.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  async createTeacher(@Body() dto: UserDTO) {
    return await this.userService.create(dto);
  }

  @Get('all')
  async getAllTeacher() {
    return await this.userService.getAllTeachers();
  }
}
