import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Institution } from "../../institution/institution.entity";
import { Item } from "../item/item.entity";
import { User } from "../user/user.entity";
import { Cabinet, CreateCabinetDTO, EditCabinetDTO } from "./cabinet.entity";
import { CabinetErrors } from "./cabinet.i18n";

@Injectable()
export class CabinetService {
  constructor(
    @InjectRepository(Cabinet)
    private cabinetRepository: Repository<Cabinet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Institution)
    private institutionRepository: Repository<Institution>
  ) {}

  async create(id: string, dto: CreateCabinetDTO) {
    let institution = await this.institutionRepository.findOne({ where: { id: dto.institution, admin: { id } } });
    let cabinet = await this.cabinetRepository.create({ cabinetNumber: dto.cabinetNumber, institution });

    if (dto.teachers) {
      const teachers = await this.userRepository.findBy({ id: In(dto.teachers) });
      cabinet.teachers = teachers;
    }

    if (dto.items !== undefined) {
      const items = await this.itemRepository.findBy({ id: In(dto.items) });
      cabinet.items = items;
    }
    return this.cabinetRepository.save(cabinet);
  }

  async get(id: string): Promise<Cabinet | null> {
    return this.cabinetRepository.findOne({ where: [{ id }, { cabinetNumber: id }] });
  }

  async getAll() {
    return this.cabinetRepository.find();
  }

  async update(id: string, dto: EditCabinetDTO): Promise<Cabinet | null> {
    const cabinet = await this.cabinetRepository.findOne({ where: { id: dto.id } });
    if (!cabinet) throw new Error(CabinetErrors.cabinet_not_found);

    if (dto.institution) {
      let institution = await this.institutionRepository.findOne({ where: { id: dto.institution, admin: { id } } });
      cabinet.institution = institution;
    }

    if (dto.cabinetNumber !== undefined) cabinet.cabinetNumber = dto.cabinetNumber;
    if (dto.teachers !== undefined) {
      // разобраться как можно передавать учителей и предметы без этих костылей
      const teachers = await this.userRepository.findBy({ id: In(dto.teachers) });
      // и начать пользоваться repository.update({ id }, dto)
      cabinet.teachers = teachers;
    }

    if (dto.items !== undefined) {
      const items = await this.itemRepository.findBy({ id: In(dto.items) });
      cabinet.items = items;
    }

    return this.cabinetRepository.save(cabinet);
  }

  async delete(id: string) {
    return this.cabinetRepository.delete(id);
  }

  async clearTable() {
    return this.cabinetRepository.delete({});
  }
}
