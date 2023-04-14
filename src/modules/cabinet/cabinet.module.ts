import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Institution } from "../../institution/institution.entity";
import { Item } from "../item/item.entity";
import { User } from "../user/user.entity";
import { CabinetController } from "./cabinet.controller";
import { Cabinet } from "./cabinet.entity";
import { CabinetService } from "./cabinet.service";

@Module({
  imports: [TypeOrmModule.forFeature([Cabinet, Item, User, Institution])],
  controllers: [CabinetController],
  providers: [CabinetService],
  exports: [CabinetService]
})
export class CabinetModule {}
