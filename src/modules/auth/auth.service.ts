import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDTO } from "../user/user.entity";
import { UserService } from "../user/user.service";
import * as argon2 from "argon2";
import { AuthLoginDTO } from "./auth.dto";
import { AuthErrors } from "./auth.i18n";

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService, private configService: ConfigService) {}

  async register(dto: CreateUserDTO) {
    const hashedPassword = await argon2.hash(dto.password);
    const user = await this.userService.create({ ...dto, password: hashedPassword });

    const tokens = await this.createTokens(user.id);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return { user, tokens };
  }

  async login(dto: AuthLoginDTO) {
    const user = await this.userService.get(dto.id);
    if (!user) throw new BadRequestException(AuthErrors.user_not_found);
    const passwordMatch = await argon2.verify(user.password, dto.password);
    if (!passwordMatch) throw new BadRequestException(AuthErrors.password_mismatch);
    const tokens = await this.createTokens(user.id);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return { user, tokens };
  }

  async createTokens(userId: number) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ id: userId }, { secret: this.configService.get("JWT_ACCESS_SECRET"), expiresIn: this.configService.get("ACCESS_TIMEOUT") }),
      this.jwtService.signAsync({ id: userId }, { secret: this.configService.get("JWT_REFRESH_SECRET"), expiresIn: this.configService.get("REFRESH_TIMEOUT") })
    ]);

    return {
      accessToken,
      refreshToken
    };
  }

  async updateRefreshToken(userId: number, token: string) {
    const hashedToken = await argon2.hash(token);
    await this.userService.update(userId, { refreshToken: hashedToken });
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.userService.get(userId);
    if (!user || !refreshToken) throw new ForbiddenException(AuthErrors.access_denied);
    const refreshTokenMatch = await argon2.verify(user.refreshToken, refreshToken);
    if (!refreshTokenMatch) throw new ForbiddenException(AuthErrors.access_denied);
    const tokens = await this.createTokens(user.id);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {
    return this.userService.update(userId, { refreshToken: null });
  }
}
