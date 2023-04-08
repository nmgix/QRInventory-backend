import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "../../modules/database/database.module";
import { CabinetModule } from "../cabinet/cabinet.module";
import { ItemModule } from "../item/item.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: ["envs/app.env", "envs/auth.env", "envs/postgres.env"], isGlobal: true }), AuthModule, DatabaseModule, UserModule, CabinetModule, ItemModule],
  controllers: [],
  providers: []
})
export class AppModule {}
