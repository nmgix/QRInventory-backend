import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Item } from "modules/item/item.entity";
import { In, Repository } from "typeorm";
import { User } from "../user/user.entity";
import { CreateInstitutionDTO, EditInstitutionDTO, Institution } from "./institution.entity";
import { InstitutionErrors } from "./institution.i18n";

@Injectable()
export class InstitutionService {
  constructor(
    @InjectRepository(Institution)
    private institutionRepository: Repository<Institution>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  getAdminInstitutions(id: string, full?: boolean) {
    return this.institutionRepository.find({ where: { admin: { id } }, relations: full === true ? ["admin", "cabinets", "items", "teachers"] : [] });
  }

  getInstitutionById(id: string, institutionId: string, full?: boolean) {
    return this.institutionRepository.findOneOrFail({ where: { admin: { id }, id: institutionId }, relations: full === true ? ["admin", "cabinets", "items", "teachers"] : [] });
  }

  async createInstitution(id: string, dto: CreateInstitutionDTO) {
    const admin = await this.userRepository.findOne({ where: { id } });
    const institution = await this.institutionRepository.create({ ...dto, admin, cabinets: [], teachers: [], items: [] });
    return this.institutionRepository.save(institution);
  }

  async editInstitution(id: string, dto: EditInstitutionDTO) {
    const institution = await this.institutionRepository.findOne({ where: { id: dto.id, admin: { id } } });
    if (!institution) throw new Error(InstitutionErrors.institution_not_found);

    if (dto.teachers) {
      console.log(dto.teachers);
      const teachers = await this.userRepository.findBy({ id: In(dto.teachers) });
      institution.teachers = teachers;
    }

    if (dto.items) {
      const items = await this.itemRepository.findBy({ id: In(dto.items) });
      institution.items = items;
    }

    if (dto.name) institution.name = dto.name;

    return this.institutionRepository.save(institution);
  }

  async deleteInstitution(id: string, institutionId: string) {
    return this.institutionRepository.delete({ id: institutionId, admin: { id } });
  }

  async clearTable() {
    return this.institutionRepository.delete({});
  }
}
