import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Item } from "modules/item/item.entity";
import { User } from "../user/user.entity";
import { InstitutionController } from "./institution.controller";
import { Institution } from "./institution.entity";
import { InstitutionService } from "./institution.service";

@Module({
  imports: [TypeOrmModule.forFeature([Institution, Item, User])],
  controllers: [InstitutionController],
  providers: [InstitutionService],
  exports: [InstitutionService]
})
export class InstitutionModule {}
