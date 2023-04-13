import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../modules/user/user.entity";
import { CreateInstitutionDTO, Institution } from "./institution.entity";

@Injectable()
export class InstitutionService {
  constructor(
    @InjectRepository(Institution)
    private institutionRepository: Repository<Institution>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  getAdminInstitutions(id: string, full?: boolean) {
    return this.institutionRepository.find({ where: { admin: { id } }, relations: full === true ? ["admin", "cabinets"] : [] });
  }

  getInstitutionById(id: string, institutionId: string, full?: boolean) {
    return this.institutionRepository.findOneOrFail({ where: { admin: { id }, id: institutionId }, relations: full === true ? ["admin", "cabinets"] : [] });
  }

  async createInstitution(id: string, dto: CreateInstitutionDTO) {
    const admin = await this.userRepository.findOne({ where: { id } });
    const institution = await this.institutionRepository.create({ ...dto, admin });
    return this.institutionRepository.save(institution);
  }
}
