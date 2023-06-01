import { registerAs } from "@nestjs/config";
import { Institution } from "../institution/institution.entity";
import { User } from "../../modules/user/user.entity";
import { Cabinet } from "../cabinet/cabinet.entity";
import { Item } from "../item/item.entity";
import Image from "./image.entity";
import { NodeENV } from "../../helpers/types";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DataSource, DataSourceOptions } from "typeorm";

import "dotenv/config";
import { join } from "path";

export const entities = [User, Cabinet, Item, Institution, Image];

export const developmentConfig: TypeOrmModuleOptions = {
  type: "postgres",
  logging: true,
  host: process.env.NODE_ENV !== NodeENV.devDocker ? "localhost" : process.env.POSTGRES_TEST_HOST,
  port: parseInt(process.env.POSTGRES_TEST_PORT),
  username: process.env.POSTGRES_TEST_USER,
  password: process.env.POSTGRES_TEST_PASSWORD,
  database: process.env.POSTGRES_TEST_DB,
  autoLoadEntities: true,
  entities: [join(__dirname, "../", "**", "*.entity.{ts,js}")],
  migrations: [join(__dirname, "../../", "migrations", "*.{ts,js}")],
  migrationsRun: true,
  retryAttempts: 10,
  dropSchema: false
};

export const productionConfig: TypeOrmModuleOptions = {
  type: "postgres",
  logging: true,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  autoLoadEntities: true,
  entities: [join(__dirname, "../", "**", "*.entity.{ts,js}")],
  migrations: [join(__dirname, "../../", "migrations", "*.{ts,js}")],

  retryAttempts: 10,
  migrationsRun: true,
  dropSchema: false
};

export default new DataSource(
  process.env.NODE_ENV === NodeENV.prod
    ? { type: "postgres", ...productionConfig }
    : { type: "postgres", ...developmentConfig }
);
