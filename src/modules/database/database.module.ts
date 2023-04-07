import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "../../modules/user/user.entity";
import { Cabinet } from "../cabinet/cabinet.entity";
import { Item } from "../item/item.entity";

const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const configs: {
    development: TypeOrmModuleOptions;
    test: TypeOrmModuleOptions;
    production: TypeOrmModuleOptions;
  } = {
    test: {
      type: "postgres",
      host: configService.get("NODE_ENV") !== "production" ? "localhost" : configService.get("POSTGRES_TEST_HOST"),
      port: configService.get("POSTGRES_TEST_PORT"),
      username: configService.get("POSTGRES_TEST_USER"),
      password: configService.get("POSTGRES_TEST_PASSWORD"),
      database: configService.get("POSTGRES_TEST_DB"),
      entities: [User, Cabinet, Item],
      synchronize: true
    },
    development: {
      type: "postgres",
      host: configService.get("NODE_ENV") !== "production" ? "localhost" : configService.get("POSTGRES_TEST_HOST"),
      port: configService.get("POSTGRES_TEST_PORT"),
      username: configService.get("POSTGRES_TEST_USER"),
      password: configService.get("POSTGRES_TEST_PASSWORD"),
      database: configService.get("POSTGRES_TEST_DB"),
      entities: [User, Cabinet, Item],
      synchronize: true
    },
    production: {
      type: "postgres",
      host: configService.get("NODE_ENV") !== "production" ? "localhost" : configService.get("POSTGRES_HOST"),
      port: configService.get("POSTGRES_PORT"),
      username: configService.get("POSTGRES_USER"),
      password: configService.get("POSTGRES_PASSWORD"),
      database: configService.get("POSTGRES_DB"),
      entities: [User, Cabinet, Item],
      synchronize: false
    }
  };

  return configs[configService.get("NODE_ENV")];
};

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService)
    })
  ]
})
export class DatabaseModule {}

export const TypeOrmTestingModule = () => [ConfigModule.forRoot({ envFilePath: [".env"], isGlobal: true }), DatabaseModule, TypeOrmModule.forFeature([User, Cabinet, Item])];
