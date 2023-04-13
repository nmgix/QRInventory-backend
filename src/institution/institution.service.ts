import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Institution } from "./institution.entity";

@Injectable()
export class InstitutionService {
  constructor(
    @InjectRepository(Institution)
    private institutionRepository: Repository<Institution>
  ) {}

  getAdminInstitutions(id: string, full?: boolean) {
    return this.institutionRepository.find({ where: { admin: { id } }, relations: full ? ["user", "cabinet"] : [] });
  }
}
