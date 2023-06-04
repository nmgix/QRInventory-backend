import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "../../modules/database/database.module";
import { CabinetModule } from "../cabinet/cabinet.module";
import { ItemModule } from "../item/item.module";
import { AuthModule } from "../auth/auth.module";
import { InstitutionModule } from "../institution/institution.module";
import { AppLoggerMiddleware } from "../../helpers/requests.logger";
import { NodeENV } from "../../helpers/types";
import { PaginationMiddleware } from "helpers/pagination.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: [".env"], isGlobal: true }),
    AuthModule,
    UserModule,
    CabinetModule,
    ItemModule,
    InstitutionModule,
    DatabaseModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    if (process.env.NODE_ENV !== NodeENV.prod) consumer.apply(AppLoggerMiddleware).forRoutes("*");
    consumer.apply(PaginationMiddleware).forRoutes(
      ...[
        { path: "user/all", method: RequestMethod.GET },
        { path: "user/search", method: RequestMethod.GET },
        { path: "item/all", method: RequestMethod.GET },
        { path: "item/", method: RequestMethod.GET },
        { path: "institution/all", method: RequestMethod.GET },
        { path: "cabinet/all", method: RequestMethod.GET },
        { path: "cabinet/", method: RequestMethod.GET }
      ]
    );
  }
}
