import { Controller, Body, Post, ClassSerializerInterceptor, UseInterceptors, Get, Param, Delete, HttpCode, UseFilters } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GlobalException } from "../../helpers/GlobalException";
import { UserSwagger } from "./user.docs";
import { CreateUserDTO, User } from "./user.entity";
import { UserErrors } from "./user.i18n";
import { UserService } from "./user.service";

@ApiTags(UserSwagger.tag)
@Controller("user")
@UseFilters(new GlobalException(UserErrors.user_data_input_error, UserErrors.user_data_input_error))
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Get("all")
  @ApiOperation({ summary: "Получение всех учителей" })
  @ApiResponse({ status: 200, description: "Все учителя", type: [User] })
  async getAllTeacher() {
    return await this.userService.getAllTeachers();
  }
  @Get(":id")
  @ApiOperation({ summary: "Получение учителя по id" })
  @ApiResponse({ status: 200, description: "Учитель, найденный в БД (либо null)", type: User })
  async getTeacher(@Param("id") id: string) {
    return await this.userService.get(id);
  }

  @Post("create")
  @ApiOperation({ summary: "Создание учителя" })
  @ApiResponse({ status: 200, description: "Созданный учитель в БД", type: User })
  async createTeacher(@Body() dto: CreateUserDTO) {
    return await this.userService.create(dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удаление учителя" })
  @ApiResponse({ status: 200, description: "Статус удален ли учитель или не найден", type: User })
  @HttpCode(200)
  async deleteTeacher(@Param("id") id: string) {
    const deleteResult = await this.userService.delete(id);

    return {
      message: UserErrors[deleteResult.affected === 0 ? "user_not_found" : "user_deleted"]
    };
  }
}
