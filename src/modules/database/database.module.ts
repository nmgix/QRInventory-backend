import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ImageController } from "./image.controller";
import { ImageService } from "./image.service";
import { dbConfigDevelopment, dbConfigProduction, entities } from "./db.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfigDevelopment, dbConfigProduction]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get(`database-${process.env.NODE_ENV}`)
      })
    }),
    TypeOrmModule.forFeature(entities)
  ],
  providers: [ImageService],
  controllers: [ImageController],
  exports: [ImageService]
})
export class DatabaseModule {}

export const TypeOrmTestingModule = () => [
  ConfigModule.forRoot({
    envFilePath: [".env"],
    isGlobal: true
  }),
  DatabaseModule
];
