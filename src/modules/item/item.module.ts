import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Institution } from "modules/institution/institution.entity";
import { DatabaseModule } from "../database/database.module";
import { ItemController } from "./item.controller";
import { Item } from "./item.entity";
import { ItemService } from "./item.service";

@Module({
  imports: [TypeOrmModule.forFeature([Institution, Item]), DatabaseModule],
  controllers: [ItemController],
  providers: [ItemService]
})
export class ItemModule {}
