import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Institution } from "modules/institution/institution.entity";
import { AuthModule } from "../auth/auth.module";
import { CabinetModule } from "../cabinet/cabinet.module";
import { DatabaseModule } from "../database/database.module";
import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@Module({
  imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([User, Institution]), CabinetModule, DatabaseModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
