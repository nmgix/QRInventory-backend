import { Controller, Body, Post, Get, Param, Delete, HttpCode, UseFilters, Req, Query, ForbiddenException, BadRequestException } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GlobalException } from "../../helpers/GlobalException";
import { Roles } from "../roles/roles.decorator";
import { UserSwagger } from "../../documentation/user.docs";
import { CreateUserDTO, UpdateUserDTO, User, UserRoles } from "./user.entity";
import { UserErrors } from "./user.i18n";
import { UserService } from "./user.service";
// import { Csrf } from "ncsrf";
import { Public } from "../auth/auth.decorator";
import { AuthedRequest } from "../auth/types";
import { AuthErrors } from "../auth/auth.i18n";

@ApiTags(UserSwagger.tag)
@Controller("user")
@UseFilters(new GlobalException(UserErrors.user_data_input_error, UserErrors.user_data_input_error, UserErrors.user_not_found))
export class UserController {
  constructor(private userService: UserService) {}

  @Roles(UserRoles.ADMIN)
  // @Csrf()
  @Get("all")
  @ApiOperation({ summary: "Получение всех учителей" })
  @ApiResponse({ status: 200, description: "Все учителя", type: [User] })
  @HttpCode(200)
  async getAllTeachers() {
    return this.userService.getAllTeachers();
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Получение учителя по id" })
  @ApiResponse({ status: 200, description: "Учитель, найденный в БД (либо null)", type: User })
  @HttpCode(200)
  async getTeacher(@Param("id") id: string) {
    return this.userService.get(null, id);
  }

  @Roles(UserRoles.TEACHER, UserRoles.ADMIN)
  // @Csrf()
  @Get()
  @ApiOperation({ summary: "Получение себя" })
  @ApiResponse({ status: 200, description: "Учитель или админ с привязанными учереждениями", type: User })
  @HttpCode(200)
  async getMe(@Req() req: AuthedRequest) {
    return this.userService.get(undefined, req.user.id, req.user.role === UserRoles.ADMIN);
  }

  @Roles(UserRoles.ADMIN)
  // @Csrf()
  @Post("create")
  @ApiOperation({ summary: "Создание учителя" })
  @ApiResponse({ status: 201, description: "Созданный учитель в БД", type: User })
  @HttpCode(201)
  async createTeacher(@Body() dto: CreateUserDTO) {
    return this.userService.create(dto);
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Post("edit")
  @ApiOperation({ summary: "Изменение пользователя" })
  @ApiQuery({ name: "id", description: "Id пользователя, передавать этот параметр только при авторизации от имени администратора", required: false, type: String })
  @ApiResponse({ status: 200, description: "Статус удален ли пользователь или не найден", type: User })
  @HttpCode(200)
  async updateUser(@Req() req: AuthedRequest, @Body() dto: UpdateUserDTO, @Query("id") id?: string) {
    if (id !== undefined && req.user.role === UserRoles.ADMIN) {
      return this.userService.updateUser(id, { ...dto, id });
    } else {
      return this.userService.updateUser(req.user.id, { ...dto, id: req.user.id });
    }
  }

  @Roles(UserRoles.ADMIN)
  // @Csrf()
  @Delete(":id")
  @ApiOperation({ summary: "Удаление пользователя" })
  @ApiResponse({ status: 200, description: "Статус удален ли пользователь или не найден" })
  @HttpCode(200)
  async deleteUser(@Param("id") id: string) {
    const deleteResult = await this.userService.delete(id);

    return {
      message: UserErrors[deleteResult.affected === 0 ? "user_not_found" : "user_deleted"]
    };
  }
}
