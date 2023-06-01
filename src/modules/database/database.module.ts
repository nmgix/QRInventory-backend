import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImageController } from "./image.controller";
import { ImageService } from "./image.service";
import { developmentConfig, productionConfig, entities } from "./db.config";
import { NodeENV } from "helpers/types";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config =
          configService.get("NODE_ENV") === NodeENV.prod ? productionConfig : developmentConfig;

        return Object.assign(
          { ...config },
          {
            autoLoadEntities: true
          }
        );
      }
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
