import { Body, ClassSerializerInterceptor, Controller, Get, Post, Req, Res, UseFilters, UseInterceptors } from "@nestjs/common";
import { Roles } from "../roles/roles.decorator";
import { CreateUserDTO, UserRoles } from "../user/user.entity";
import { AuthLoginDTO } from "./auth.dto";
import { AuthService } from "./auth.service";
// import { Csrf } from "ncsrf";
import { AuthedRequest, Tokens } from "./types";
import { Response } from "express";
import { Public } from "./auth.decorator";
import { AuthSwagger } from "./auth.docs";
import { ApiTags } from "@nestjs/swagger";
import { GlobalException } from "../../helpers/GlobalException";
import { AuthErrors } from "./auth.i18n";

@ApiTags(AuthSwagger.tag)
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new GlobalException(AuthErrors.query_fail, AuthErrors.bad_request))
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // регистрировать только учителей, админ создаётся вручную в докере
  @Roles(UserRoles.ADMIN)
  //   @Csrf()
  @Post("register")
  async register(@Body() dto: CreateUserDTO, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.register(dto);
    res.cookie(Tokens.access_token, tokens.accessToken, { signed: true, httpOnly: true, maxAge: +process.env.ACCESS_TIMEOUT * 1000 });
    res.cookie(Tokens.refresh_token, tokens.refreshToken, { signed: true, httpOnly: true, maxAge: +process.env.REFRESH_TIMEOUT * 1000 });
    return user;
  }

  @Public()
  @Post("login")
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
  async logout(@Req() req: AuthedRequest) {
    return this.authService.logout(req.user.id);
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  //   @Csrf()
  @Get("refresh")
  async refresh(@Req() req: AuthedRequest) {
    // return this.authService.refreshTokens(req.user.id)
  }
}
