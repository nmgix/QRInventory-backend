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
      const teachers = await this.userRepository.findBy({ id: In(dto.teachers), teacherInstitution: { id: institution.id } });
      cabinet.teachers = teachers;
    }

    if (dto.items !== undefined) {
      const items = await this.itemRepository.findBy({ id: In(dto.items), institution: { id: institution.id } });
      cabinet.items = items;
    }
    return this.cabinetRepository.save(cabinet);
  }

  async get(take?: number, skip?: number, id?: string, cabinet?: string) {
    return this.cabinetRepository
      .createQueryBuilder("cabinet")
      .where("cabinet.cabinetNumber LIKE :cabinetNumber OR cabinet.id = :id", { id, cabinetNumber: `%${cabinet}%` })
      .offset(id ? 0 : skip ? skip : 0)
      .limit(id ? 1 : take ? take : 10)
      .leftJoinAndSelect("cabinet.teachers", "user")
      .leftJoinAndSelect("cabinet.items", "item")
      .getManyAndCount();
  }

  async getAdminAll(userId: string, institution: string, take: number = 10, skip: number = 0) {
    if (!institution) throw new BadRequestException(InstitutionErrors.institution_not_stated);
    return this.cabinetRepository
      .createQueryBuilder("cabinet")
      .leftJoinAndSelect("cabinet.institution", "institution")
      .where("institution.id = :institutionId AND institution.admin.id = :adminId", { institutionId: institution, adminId: userId })
      .leftJoinAndSelect("cabinet.teachers", "teachers")
      .leftJoinAndSelect("cabinet.items", "items")
      .offset(skip)
      .limit(take)
      .getManyAndCount();
  }

  async getTeacherAll(userId: string, institution: string, take: number = 10, skip: number = 0) {
    console.log("отрабатываем");
    if (!institution) throw new BadRequestException(InstitutionErrors.institution_not_stated);
    // return this.cabinetRepository.findAndCount({ where: { teachers: { id: userId }, institution: { id: institution } }, take, skip });
    return this.cabinetRepository
      .createQueryBuilder("cabinet")
      .leftJoinAndSelect("cabinet.institution", "institution")
      .leftJoinAndSelect("cabinet.teachers", "teachers")
      .leftJoinAndSelect("cabinet.items", "items")
      .where("institution.id = :institutionId AND teachers.id = :teacherId", { institutionId: institution, teacherId: userId })
      .offset(skip)
      .limit(take)
      .getManyAndCount();
  }

  async update(userId: string, id: string, dto: EditCabinetDTO): Promise<Cabinet | null> {
    const cabinet = await this.cabinetRepository.findOne({
      where: [
        { id: dto.id, institution: { admin: { id: userId } } },
        { id: dto.id, teachers: { id: userId } }
      ]
    });
    if (!cabinet) throw new Error(CabinetErrors.cabinet_not_found);
    let currentInstitution = await this.institutionRepository.findOne({ where: [{ admin: { id: userId } }, { teachers: { id: userId } }] });
    let futureInstitution: Institution;

    if (dto.institution) {
      futureInstitution = await this.institutionRepository.findOne({ where: { id: dto.institution, admin: { id } } });
      cabinet.institution = futureInstitution;
    }

    if (dto.cabinetNumber !== undefined) cabinet.cabinetNumber = dto.cabinetNumber;
    if (dto.teachers !== undefined) {
      // разобраться как можно передавать учителей и предметы без этих костылей
      const teachers = await this.userRepository.findBy({ id: In(dto.teachers), teacherInstitution: { id: futureInstitution ? futureInstitution.id : currentInstitution.id } });
      // и начать пользоваться repository.update({ id }, dto)
      cabinet.teachers = teachers;
    }

    if (dto.items !== undefined) {
      const items = await this.itemRepository.findBy({ id: In(dto.items), institution: { id: futureInstitution ? futureInstitution.id : currentInstitution.id } });
      cabinet.items = items;
    }

    return this.cabinetRepository.save(cabinet);
  }

  async delete(userId: string, id: string) {
    const cabinet = await this.cabinetRepository.findOne({
      where: [
        { id, institution: { admin: { id: userId } } },
        { id, teachers: { id: userId } }
      ]
    });
    if (!cabinet) throw new Error(CabinetErrors.cabinet_not_found);
    return this.cabinetRepository.delete(id);
  }

  async clearTable() {
    return this.cabinetRepository.delete({});
  }
}
