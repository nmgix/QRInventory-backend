import "dotenv/config";
import { join } from "path";
import { NodeENV } from "../../helpers/types";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { Institution } from "../institution/institution.entity";
import { User } from "../../modules/user/user.entity";
import { Cabinet } from "../cabinet/cabinet.entity";
import { Item } from "../item/item.entity";
import { PasswordRequestTicket } from "../user/password-requests/ticket.entity";
import Image from "./image.entity";

export const entities = [User, Cabinet, Item, Institution, Image, PasswordRequestTicket];

export const developmentConfig: TypeOrmModuleOptions = {
  type: "postgres",
  logging: false,
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
  logging: false,
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
  process.env.NODE_ENV === NodeENV.prod ? { type: "postgres", ...productionConfig } : { type: "postgres", ...developmentConfig }
);
