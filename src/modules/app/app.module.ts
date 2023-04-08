import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "../../modules/database/database.module";
import { CabinetModule } from "../cabinet/cabinet.module";
import { ItemModule } from "../item/item.module";
import { AuthModule } from "../auth/auth.module";
import { RolesGuard } from "../roles/roles.guard";
import { AuthGuard } from "../auth/auth.guard";

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: ["envs/app.env", "envs/auth.env", "envs/postgres.env"], isGlobal: true }), AuthModule, DatabaseModule, UserModule, CabinetModule, ItemModule],
  controllers: [],
  providers: [
    {
      provide: "ROLES_GUARD",
      useClass: RolesGuard
    },
    {
      provide: "AUTH_GUARD",
      useClass: AuthGuard
    }
  ]
})
export class AppModule {}
