import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Institution } from "../../institution/institution.entity";
import { User } from "../../modules/user/user.entity";
import { Cabinet } from "../cabinet/cabinet.entity";
import { Item } from "../item/item.entity";

const entities = [User, Cabinet, Item, Institution];

const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const mode = configService.get("NODE_ENV");

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
      entities,
      synchronize: true,
      retryAttempts: 5,
      logging: true
    },
    development: {
      type: "postgres",
      host: configService.get("NODE_ENV") !== "production" ? "localhost" : configService.get("POSTGRES_TEST_HOST"),
      port: configService.get("POSTGRES_TEST_PORT"),
      username: configService.get("POSTGRES_TEST_USER"),
      password: configService.get("POSTGRES_TEST_PASSWORD"),
      database: configService.get("POSTGRES_TEST_DB"),
      entities,
      synchronize: true,
      retryAttempts: 5,
      logging: true
    },
    production: {
      type: "postgres",
      host: configService.get("NODE_ENV") !== "production" ? "localhost" : configService.get("POSTGRES_HOST"),
      port: configService.get("POSTGRES_PORT"),
      username: configService.get("POSTGRES_USER"),
      password: configService.get("POSTGRES_PASSWORD"),
      database: configService.get("POSTGRES_DB"),
      entities,
      synchronize: false
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
    })
  ]
})
export class DatabaseModule {}

export const TypeOrmTestingModule = () => [ConfigModule.forRoot({ envFilePath: [".env"], isGlobal: true }), DatabaseModule, TypeOrmModule.forFeature(entities)];
