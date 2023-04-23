import { MiddlewareConsumer, Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "../../modules/database/database.module";
import { CabinetModule } from "../cabinet/cabinet.module";
import { ItemModule } from "../item/item.module";
import { AuthModule } from "../auth/auth.module";
import { InstitutionModule } from "../institution/institution.module";
import { AppLoggerMiddleware } from "../../helpers/requests.logger";
import { NodeENV } from "../../helpers/types";

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: [".env"], isGlobal: true }), AuthModule, DatabaseModule, UserModule, CabinetModule, ItemModule, InstitutionModule],
  controllers: [],
  providers: []
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    if (process.env.NODE_ENV !== NodeENV.prod) consumer.apply(AppLoggerMiddleware).forRoutes("*");
  }
}
