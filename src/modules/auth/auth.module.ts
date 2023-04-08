import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [UserModule, ConfigModule, JwtModule.register({ global: true, secret: process.env.JWT_SECRET })],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
