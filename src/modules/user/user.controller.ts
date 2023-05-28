import { Controller, Body, Post, Get, Param, Delete, HttpCode, UseFilters, Req, Query, BadRequestException, UseInterceptors, UploadedFile, Patch, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";

import { GlobalException } from "../../helpers/global.exceptions";
import { Roles } from "../roles/roles.decorator";
import { Public } from "../auth/auth.decorator";
import { UserSwagger } from "../../documentation/user.docs";

import { CreateUserDTO, UpdateUserDTO, User, UserRoles } from "./user.entity";
import { UserErrors, UserMessages } from "./user.i18n";
import { AuthedRequest } from "../auth/types";
import { AuthService } from "modules/auth/auth.service";
import { UserService } from "./user.service";
import { UpdateResult } from "typeorm";

@ApiTags(UserSwagger.tag)
@Controller("user")
@UseFilters(new GlobalException(UserErrors.user_data_input_error, UserErrors.user_data_input_error, UserErrors.user_not_found))
export class UserController {
  constructor(private userService: UserService, private authService: AuthService) {}

  @Roles(UserRoles.ADMIN)
  @Get("all")
  @HttpCode(200)
  @ApiOperation({ summary: "Получение всех учителей" })
  @ApiQuery({ name: "institution", required: true, description: "Учреждение по которому искать (id)" })
  @ApiQuery({ name: "take", required: false, description: "Сколько записей взять" })
  @ApiQuery({ name: "skip", required: false, description: "Сколько записей пропустить" })
  @ApiResponse({ status: 200, description: "Все учителя", type: [User] })
  async getAllTeachers(@Query() { take, skip }, @Query("institution") institution: string) {
    const [data, total] = await this.userService.getAllTeachers(institution, take, skip);
    return {
      users: data,
      total
    };
  }

  @Public()
  @Get("search")
  @HttpCode(200)
  @ApiOperation({ summary: "Получение учителя по id, либо fio" })
  @ApiQuery({ name: "fio", required: false, description: "Для запроса другого пользователя по fio" })
  @ApiQuery({ name: "institution", description: "id учреждения", required: false })
  @ApiQuery({ name: "id", required: false, description: "Для запроса другого пользователя по id" })
  @ApiQuery({ name: "email", required: false, description: "Для запроса другого пользователя по email" })
  @ApiQuery({ name: "take", required: false, description: "Сколько записей взять" })
  @ApiQuery({ name: "skip", required: false, description: "Сколько записей пропустить" })
  @ApiResponse({ status: 200, description: "Учитель, найденный в БД (либо null)", type: User })
  async getTeacher(@Query() { take, skip }, @Query("fio") fio?: string, @Query("institution") institution?: string, @Query("id") id?: string, @Query("email") email?: string) {
    if (!id && !institution) throw new BadRequestException(UserErrors.no_id_no_institution);
    const [data, total] = await this.userService.get(institution, take, skip, email, id, fio, false);

    if (id) {
      return data[0];
    } else {
      return {
        users: data,

        total
      };
    }
  }

  @Roles(UserRoles.TEACHER, UserRoles.ADMIN)
  @Get()
  @ApiOperation({ summary: "Получение себя" })
  @ApiResponse({ status: 200, description: "Учитель или админ с привязанными учереждениями", type: User })
  @HttpCode(200)
  async getUser(@Req() req: AuthedRequest) {
    return this.userService.getById(req.user.id, req.user.role === UserRoles.ADMIN);
  }

  @Roles(UserRoles.ADMIN)
  @Post("create")
  @ApiOperation({ summary: "Создание учителя" })
  @ApiResponse({ status: 201, description: "Созданный учитель в БД", type: User })
  @HttpCode(201)
  async createTeacher(@Body() dto: CreateUserDTO) {
    return this.authService.register(dto);
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Post("avatar/:id")
  @ApiOperation({ summary: "Загрузка фотографии пользователя" })
  @ApiResponse({ status: 201, description: "Сообщение об успешной загрузке фотографии" })
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(201)
  async addAvatar(
    @Req() req: AuthedRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), new FileTypeValidator({ fileType: ".(png|jpeg|jpg|gif)" })]
      })
    )
    file: Express.Multer.File,
    @Param("id") id?: string
  ) {
    const result = await this.userService.addAvatar(req.user.role === UserRoles.ADMIN ? id ?? req.user.id : req.user.id, file.buffer, file.originalname);
    return {
      message: `Фотография загружена, id: ${result.id}`
    };
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Patch("edit")
  @ApiOperation({ summary: "Изменение пользователя" })
  @ApiQuery({ name: "id", description: "Id пользователя, передавать этот параметр только при авторизации от имени администратора", required: false, type: String })
  @ApiResponse({ status: 200, description: "Статус удален ли пользователь или не найден", type: User })
  @HttpCode(200)
  async updateUser(@Req() req: AuthedRequest, @Body() dto: UpdateUserDTO, @Query("id") id?: string) {
    let updateResult: UpdateResult;
    if (id !== undefined && req.user.role === UserRoles.ADMIN) {
      updateResult = await this.userService.updateUser(id, { ...dto, id }, req.user.role);
    } else {
      updateResult = await this.userService.updateUser(req.user.id, { ...dto, id: req.user.id }, req.user.role);
    }

    return {
      message: updateResult.affected === 0 ? UserErrors.user_not_updated : UserMessages.user_updated
    };
  }

  @Roles(UserRoles.ADMIN)
  @Delete(":id")
  @ApiOperation({ summary: "Удаление пользователя" })
  @ApiResponse({ status: 200, description: "Статус удален ли пользователь или не найден" })
  @HttpCode(200)
  async deleteUser(@Param("id") id: string) {
    const deleteResult = await this.userService.delete(id);

    return {
      message: deleteResult.affected === 0 ? UserErrors.user_not_found : UserMessages.user_deleted
    };
  }
}
