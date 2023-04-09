import { Body, ClassSerializerInterceptor, Controller, Get, HttpCode, Post, Query, Req, Res, UseFilters, UseInterceptors } from "@nestjs/common";
import { Roles } from "../roles/roles.decorator";
import { CreateUserDTO, User, UserRoles } from "../user/user.entity";
import { AuthLoginDTO } from "./auth.dto";
import { AuthService } from "./auth.service";
// import { Csrf } from "ncsrf";
import { AuthedRequest, Tokens } from "./types";
import { Response } from "express";
import { Public } from "./auth.decorator";
import { AuthSwagger } from "../../documentation/auth.docs";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GlobalException } from "../../helpers/GlobalException";
import { AuthErrors, AuthMessages } from "./auth.i18n";

@ApiTags(AuthSwagger.tag)
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new GlobalException(AuthErrors.query_fail, AuthErrors.bad_request))
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // регистрировать только учителей, админ создаётся вручную в докере
  @Roles(UserRoles.ADMIN)
  //   @Csrf()
  @ApiOperation({ summary: "Регистрация учителя (доступна админу)" })
  @ApiResponse({ status: 200, description: "Учитель" })
  @Post("register")
  async register(@Body() dto: CreateUserDTO, @Res({ passthrough: true }) res: Response) {
    await this.authService.register(dto);
    return {
      message: AuthMessages.user_created
    };
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Авторизация под id и паролем" })
  @ApiResponse({ status: 200, description: "Учитель / Админ", type: User })
  @HttpCode(200)
  async login(@Body() dto: AuthLoginDTO, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.login(dto);
    // возможно поставить same site есть смысл
    res.cookie(Tokens.access_token, tokens.accessToken, { signed: true, httpOnly: true, maxAge: +process.env.ACCESS_TIMEOUT * 1000 });
    res.cookie(Tokens.refresh_token, tokens.refreshToken, { signed: true, httpOnly: true, maxAge: +process.env.REFRESH_TIMEOUT * 1000 });
    return user;
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  //   @Csrf()
  @Get("logout")
  @ApiOperation({ summary: "Выход из пользователя" })
  @ApiResponse({ status: 200 })
  async logout(@Req() req: AuthedRequest, @Res({ passthrough: true }) res: Response) {
    res.clearCookie(Tokens.access_token);
    res.clearCookie(Tokens.refresh_token);
    await this.authService.logout(req.user.id);
    return;
  }
}
