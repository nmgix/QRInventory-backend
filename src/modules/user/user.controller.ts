import { Controller, Body, Post, ClassSerializerInterceptor, UseInterceptors, Get, Param, Delete, HttpCode, UseFilters, Req, SerializeOptions, UseGuards, Query, ForbiddenException, BadRequestException } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GlobalException } from "../../helpers/GlobalException";
import { Roles } from "../roles/roles.decorator";
import { UserSwagger } from "../../documentation/user.docs";
import { CreateUserDTO, User, UserRoles } from "./user.entity";
import { UserErrors } from "./user.i18n";
import { UserService } from "./user.service";
// import { Csrf } from "ncsrf";
import { Public } from "../auth/auth.decorator";
import { AuthedRequest } from "../auth/types";
import { AuthErrors } from "../auth/auth.i18n";

@ApiTags(UserSwagger.tag)
@Controller("user")
@UseFilters(new GlobalException(UserErrors.user_data_input_error, UserErrors.user_data_input_error))
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Roles(UserRoles.ADMIN)
  // @Csrf()
  @Get("all")
  @ApiOperation({ summary: "Получение всех учителей" })
  @ApiResponse({ status: 200, description: "Все учителя", type: [User] })
  @HttpCode(200)
  async getAllTeacher() {
    return this.userService.getAllTeachers();
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Получение учителя по id" })
  @ApiResponse({ status: 200, description: "Учитель, найденный в БД (либо null)", type: User })
  @HttpCode(200)
  async getTeacher(@Param("id") id: number) {
    return this.userService.get(null, id);
  }

  @Roles(UserRoles.TEACHER)
  // @Csrf()
  @Get()
  // @SerializeOptions({
  //   groups: ["role:teacher", "role:admin"]
  // })
  @ApiOperation({ summary: "Получение себя (учителя) по id" })
  @ApiResponse({ status: 200, description: "Учитель, найденный в БД (либо null)", type: User })
  @HttpCode(200)
  async getMe(@Req() req: AuthedRequest) {
    return this.userService.get(null, req.user.id);
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
  @ApiOperation({ summary: "Изменение учителя" })
  @ApiResponse({ status: 200, description: "Статус удален ли учитель или не найден", type: User })
  @HttpCode(200)
  async updateTeacher(@Req() req: AuthedRequest, @Query("id") id: number, @Body() dto: Partial<CreateUserDTO>) {
    if (req.user.role === UserRoles.TEACHER) {
      return this.userService.update(req.user.id, dto);
    } else if (req.user.role === UserRoles.ADMIN) {
      if (id) {
        return this.userService.update(id, dto);
      } else throw new BadRequestException(UserErrors.id_empty);
    } else throw new ForbiddenException(AuthErrors.access_denied);
  }

  @Roles(UserRoles.ADMIN)
  // @Csrf()
  @Delete(":id")
  @ApiOperation({ summary: "Удаление учителя" })
  @ApiResponse({ status: 200, description: "Статус удален ли учитель или не найден", type: User })
  @HttpCode(200)
  async deleteTeacher(@Param("id") id: number) {
    const deleteResult = await this.userService.delete(id);

    return {
      message: UserErrors[deleteResult.affected === 0 ? "user_not_found" : "user_deleted"]
    };
  }
}
