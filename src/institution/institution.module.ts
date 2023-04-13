import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InstitutionController } from "./institution.controller";
import { Institution } from "./institution.entity";
import { InstitutionService } from "./institution.service";

@Module({
  imports: [TypeOrmModule.forFeature([Institution])],
  controllers: [InstitutionController],
  providers: [InstitutionService]
})
export class InstitutionModule {}
