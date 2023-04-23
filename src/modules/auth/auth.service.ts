import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDTO, InternalUpdateUserDTO, UpdateUserDTO, User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import * as argon2 from "argon2";
import { AuthLoginDTO } from "./auth.dto";
import { AuthErrors } from "./auth.i18n";

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(dto: Partial<User>) {
    const hashedPassword = await argon2.hash(dto.password);
    const user = await this.userService.create({ ...dto, password: hashedPassword });

    const tokens = await this.createTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return { user, tokens };
  }

  async login(dto: AuthLoginDTO) {
    const user = await this.userService.get(dto.email, undefined, undefined, true);
    if (!user) throw new BadRequestException(AuthErrors.user_not_found);
    const passwordMatch = await argon2.verify(user.password, dto.password);
    if (!passwordMatch) throw new BadRequestException(AuthErrors.password_mismatch);
    const tokens = await this.createTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return { user, tokens };
  }

  async updatePassword(dto: InternalUpdateUserDTO) {
    let user = await this.userService.get(undefined, dto.id, undefined, true);
    if (!user) throw new BadRequestException(AuthErrors.user_not_found);
    const passwordMatch = await argon2.verify(user.password, dto.oldPassword);
    if (!passwordMatch) throw new BadRequestException(AuthErrors.password_mismatch);
    if (!dto.newPassword) throw new BadRequestException(AuthErrors.password_empty);
    const hashedPassword = await argon2.hash(dto.newPassword);
    await this.userService.update(user.id, { password: hashedPassword });
    const tokens = await this.createTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return true;
  }

  async createTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ id: user.id, role: user.role }, { secret: this.configService.get("JWT_ACCESS_SECRET"), expiresIn: +this.configService.get("ACCESS_TIMEOUT") * 1000 }),
      this.jwtService.signAsync({ id: user.id, role: user.role }, { secret: this.configService.get("JWT_REFRESH_SECRET"), expiresIn: +this.configService.get("REFRESH_TIMEOUT") * 1000 })
    ]);

    return {
      accessToken,
      refreshToken
    };
  }

  async updateRefreshToken(userId: string, token: string) {
    const hashedToken = await argon2.hash(token);
    await this.userService.update(userId, { refreshToken: hashedToken });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.get(undefined, userId, undefined, true);
    if (!user || !refreshToken) throw new ForbiddenException(AuthErrors.access_denied, `Пользователь не найден, либо не указан refresh-токен`);
    const refreshTokenMatch = await argon2.verify(user.refreshToken, refreshToken);
    if (!refreshTokenMatch) throw new ForbiddenException(AuthErrors.access_denied, `Refresh-токены не сходятся`);
    const tokens = await this.createTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async validatePassword(userId: string, inputPassword: string) {
    const user = await this.userService.get(null, userId, undefined, true);
    if (!user) throw new ForbiddenException(AuthErrors.access_denied, `Пользователь не найден`);
    return argon2.verify(user.password, inputPassword);
  }

  async logout(userId: string) {
    return this.userService.update(userId, { refreshToken: null });
  }
}
