import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Institution } from "../institution/institution.entity";
import { User } from "../../modules/user/user.entity";
import { Cabinet } from "../cabinet/cabinet.entity";
import { Item } from "../item/item.entity";
import { ImageController } from "./image.controller";
import { ImageService } from "./image.service";
import Image from "./image.entity";
import { NodeENV } from "../../helpers/types";

export const entities = [User, Cabinet, Item, Institution, Image];

const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const mode = configService.get("NODE_ENV");

  const configs: {
    developmentdocker: TypeOrmModuleOptions;
    development: TypeOrmModuleOptions;
    production: TypeOrmModuleOptions;
  } = {
    developmentdocker: {
      type: "postgres",
      host: configService.get("POSTGRES_TEST_HOST"),
      port: configService.get("POSTGRES_TEST_PORT"),
      username: configService.get("POSTGRES_TEST_USER"),
      password: configService.get("POSTGRES_TEST_PASSWORD"),
      database: configService.get("POSTGRES_TEST_DB"),
      entities,
      synchronize: true,
      retryAttempts: 5
    },
    development: {
      type: "postgres",
      host: configService.get("NODE_ENV") !== NodeENV.prod ? "localhost" : configService.get("POSTGRES_TEST_HOST"),
      port: configService.get("POSTGRES_TEST_PORT"),
      username: configService.get("POSTGRES_TEST_USER"),
      password: configService.get("POSTGRES_TEST_PASSWORD"),
      database: configService.get("POSTGRES_TEST_DB"),
      entities,
      synchronize: true,
      retryAttempts: 5
    },
    production: {
      type: "postgres",
      host: configService.get("NODE_ENV") !== NodeENV.prod ? "localhost" : configService.get("POSTGRES_HOST"),
      port: configService.get("POSTGRES_PORT"),
      username: configService.get("POSTGRES_USER"),
      password: configService.get("POSTGRES_PASSWORD"),
      database: configService.get("POSTGRES_DB"),
      entities,
      // synchronize: false,
      synchronize: true
      // migrations: ["src/modules/database/migrations/*.ts"]
    }
  };
  Logger.warn(`Подключение к ${mode} БД`);

  return configs[mode];
};

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService)
    }),
    TypeOrmModule.forFeature(entities)
  ],
  providers: [ImageService],
  controllers: [ImageController],
  exports: [ImageService]
})
export class DatabaseModule {}

export const TypeOrmTestingModule = () => [ConfigModule.forRoot({ envFilePath: [".env"], isGlobal: true }), DatabaseModule];
