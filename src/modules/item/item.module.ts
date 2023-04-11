import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ItemController } from "./item.controller";
import { Item } from "./item.entity";
import { ItemService } from "./item.service";

@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  controllers: [ItemController],
  providers: [ItemService]
})
export class ItemModule {}
