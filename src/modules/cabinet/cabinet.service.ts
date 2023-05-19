import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InstitutionErrors } from "modules/institution/institution.i18n";
import { In, Like, QueryFailedError, Repository } from "typeorm";
import { AuthErrors } from "../auth/auth.i18n";
import { Institution } from "../institution/institution.entity";
import { Item } from "../item/item.entity";
import { User, UserRoles } from "../user/user.entity";
import { UserErrors } from "../user/user.i18n";
import { Cabinet, CreateCabinetDTO, EditCabinetDTO } from "./cabinet.entity";
import { CabinetErrors, CabinetMessages } from "./cabinet.i18n";

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
    let user = await this.userRepository.findOne({ where: { id } });
    let institution = await this.institutionRepository.findOne({ where: { id: dto.institution }, relations: ["cabinets"] });
    if (!institution) throw new Error(InstitutionErrors.institution_not_found);

    let cabinet = await this.cabinetRepository.create({ cabinetNumber: dto.cabinetNumber, institution });
    if (institution.cabinets.find(instCab => instCab.cabinetNumber === cabinet.cabinetNumber)) throw new BadRequestException(CabinetErrors.cabinet_exists);

    if (user.role === UserRoles.TEACHER) dto.teachers.length > 0 ? dto.teachers.push(id) : (dto.teachers = [id]);
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

  async get(take?: number, skip?: number, id?: string, cabinet?: string) {
    const values = [{ name: "cabinetNumber", value: cabinet, alias: cabinet }].filter(item => item.value !== undefined);

    return this.cabinetRepository.findAndCount({
      where: id ? { id } : [...values.map(v => ({ [v.name]: Like("%" + v.alias + "%") }))],
      take: id ? 1 : take ? take : 10,
      skip: id ? 0 : skip ? skip : 0,
      order: { id: "ASC" }
    });
  }

  async getAdminAll(userId: string, institution: string, take: number = 10, skip: number = 0) {
    if (!institution) throw new BadRequestException(InstitutionErrors.institution_not_stated);
    return this.cabinetRepository.findAndCount({ where: { institution: { id: institution, admin: { id: userId } } }, take, skip });
  }

  async getTeacherAll(userId: string, institution: string, take: number = 10, skip: number = 0) {
    if (!institution) throw new BadRequestException(InstitutionErrors.institution_not_stated);
    return this.cabinetRepository.findAndCount({ where: { teachers: { id: userId }, institution: { id: institution } }, take, skip });
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
