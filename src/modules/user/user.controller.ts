import { Controller, Body, Post, Get, Param, Delete, HttpCode, UseFilters, Req, Query, ForbiddenException, BadRequestException, UseInterceptors, UploadedFile } from "@nestjs/common";
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
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import FilesInterceptor from "../../helpers/files.interceptor";

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
  @Get("search")
  @ApiOperation({ summary: "Получение учителя по id, либо fio" })
  @ApiResponse({ status: 200, description: "Учитель, найденный в БД (либо null)", type: User })
  @ApiQuery({ name: "fio", required: false, description: "Для запроса другого пользователя по fio" })
  @ApiQuery({ name: "id", required: false, description: "Для запроса другого пользователя по id" })
  @ApiQuery({ name: "email", required: false, description: "Для запроса другого пользователя по email" })
  @HttpCode(200)
  async getTeacher(@Query("fio") fio?: string, @Query("id") id?: string, @Query("email") email?: string) {
    return this.userService.get(email, id, fio, false);
  }

  @Roles(UserRoles.TEACHER, UserRoles.ADMIN)
  // @Csrf()
  @Get()
  @ApiOperation({ summary: "Получение себя" })
  @ApiResponse({ status: 200, description: "Учитель или админ с привязанными учереждениями", type: User })
  @HttpCode(200)
  async getUser(@Req() req: AuthedRequest) {
    return this.userService.get(undefined, req.user.id, undefined, req.user.role === UserRoles.ADMIN);
  }

  @Roles(UserRoles.ADMIN)
  // @Csrf()
  @Post("create")
  @ApiOperation({ summary: "Создание учителя" })
  @ApiResponse({ status: 201, description: "Созданный учитель в БД", type: User })
  @HttpCode(201)
  async createTeacher(@Body() dto: CreateUserDTO, @UploadedFile() file: Express.Multer.File) {
    return this.userService.create(dto);
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Post("avatar")
  @ApiOperation({ summary: "Загрузка фотографии пользователя" })
  @ApiResponse({ status: 201, description: "Сообщение об успешной загрузке фотографии" })
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(201)
  async addAvatar(@Req() req: AuthedRequest, @UploadedFile() file: Express.Multer.File) {
    const result = await this.userService.addAvatar(req.user.id, file.buffer, file.originalname);
    return {
      message: `Фотография загружена, id: ${result.id}`
    };
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
