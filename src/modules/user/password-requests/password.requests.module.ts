import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "modules/auth/auth.module";
import { DatabaseModule } from "modules/database/database.module";
import { Institution } from "modules/institution/institution.entity";
import { InstitutionModule } from "modules/institution/institution.module";
import { User } from "../user.entity";
import { UserModule } from "../user.module";
import { PasswordRequestsController } from "./password.requests.controller";
import { PasswordRequestsService } from "./password.requests.service";
import { PasswordRequestTicket } from "./ticket.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Institution, PasswordRequestTicket]),
    DatabaseModule,
    InstitutionModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule)
  ],
  providers: [PasswordRequestsService],
  controllers: [PasswordRequestsController],
  exports: [PasswordRequestsService]
})
export class PasswordRequestsModule {}
