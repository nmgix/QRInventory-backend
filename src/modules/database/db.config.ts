import { registerAs } from "@nestjs/config";

import { Institution } from "../institution/institution.entity";
import { User } from "../../modules/user/user.entity";
import { Cabinet } from "../cabinet/cabinet.entity";
import { Item } from "../item/item.entity";
import Image from "./image.entity";
import { NodeENV } from "helpers/types";

export const entities = [User, Cabinet, Item, Institution, Image];

export const dbConfigDevelopment = registerAs("database-development", () => {
  return {
    type: "postgres",
    logging: true,
    host: process.env.NODE_ENV !== NodeENV.devDocker ? "localhost" : process.env.POSTGRES_TEST_HOST,
    port: parseInt(process.env.POSTGRES_TEST_PORT),
    username: process.env.POSTGRES_TEST_USER,
    password: process.env.POSTGRES_TEST_PASSWORD,
    database: process.env.POSTGRES_TEST_DB,
    autoLoadEntities: true,
    entities,
    synchronize: true,
    retryAttempts: 10,
    cli: {
      migrationsDir: "src/migrations"
    }
  };
});

export const dbConfigProduction = registerAs("database-production", () => {
  return {
    type: "postgres",
    logging: true,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    autoLoadEntities: true,
    entities: ["src/**/*.entity.ts"],
    migrations: ["src/migrations/*{.ts,.js}"],
    migrationsRun: true,
    cli: {
      migrationsDir: "src/migrations"
    }
  };
});
