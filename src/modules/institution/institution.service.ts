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

  getAdminInstitutions(id: string, take: number = 10, skip: number = 0) {
    return this.institutionRepository
      .createQueryBuilder("institution")
      .leftJoin("institution.admin", "user")
      .loadRelationCountAndMap("institution.teachers", "institution.teachers")
      .loadRelationCountAndMap("institution.items", "institution.items")
      .loadRelationCountAndMap("institution.cabinets", "institution.cabinets")
      .where("user.id = :admin", { admin: id })
      .orderBy("institution.name", "ASC")
      .offset(skip)
      .limit(take)
      .getManyAndCount();
  }

  async getInstitutionById(id: string, institutionId: string) {
    return this.institutionRepository.findOneOrFail({
      where: { admin: { id }, id: institutionId }
    });
  }

  async institutionExists(institutionId: string) {
    const institution = await this.institutionRepository.count({ where: { id: institutionId } });
    return institution === 1;
  }

  async createInstitution(id: string, dto: CreateInstitutionDTO) {
    const admin = await this.userRepository.findOne({ where: { id } });
    const institution = await this.institutionRepository.create({
      ...dto,
      admin,
      cabinets: [],
      teachers: [],
      items: []
    });
    return this.institutionRepository.save(institution);
  }

  async editInstitution(id: string, dto: EditInstitutionDTO) {
    const institution = await this.institutionRepository.findOne({
      where: { id: dto.id, admin: { id } }
    });
    if (!institution) throw new Error(InstitutionErrors.institution_not_found);

    if (dto.teachers) {
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

  // async deleteInstitution(id: string, institutionId: string) {
  //   return this.institutionRepository.delete({ id: institutionId, admin: { id } });
  // }
}
