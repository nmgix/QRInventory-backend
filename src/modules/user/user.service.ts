import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common/exceptions";
import { InjectRepository } from "@nestjs/typeorm";
import { Equal, Like, Not, Repository } from "typeorm";
import { AuthService } from "../auth/auth.service";
import { CreateUserDTO, InternalUpdateUserDTO, UpdateUserDTO, User, UserRoles } from "./user.entity";
import { UserErrors } from "./user.i18n";
import { DatabaseFileService } from "../database/database.file.service";
import { Institution } from "modules/institution/institution.entity";
import { InstitutionErrors } from "modules/institution/institution.i18n";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Institution)
    private institutionRepository: Repository<Institution>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private databaseFileService: DatabaseFileService
  ) {}

  getAllTeachers() {
    return this.userRepository.find({ where: { role: UserRoles.TEACHER } });
  }

  async get(email?: string, id?: string, fio?: string, admin?: boolean) {
    // https://github.com/typeorm/typeorm/issues/2500
    // https://stackoverflow.com/questions/71003990/excluding-undefined-field-values-in-mariadb-typeorm-queries
    const values = [
      { name: "email", value: email, alias: email },
      { name: "id", value: id, alias: id },
      { name: "fullName", value: fio, alias: Like(`%${fio}%`) }
    ].filter(item => item.value !== undefined);

    if (admin) {
      let user = await this.userRepository.findOneOrFail({
        where: [...values.map(v => ({ [v.name]: v.alias }))],
        relations: ["institutions", "teacherInstitution"]
      });
      if (user.role !== UserRoles.ADMIN) delete user.institutions;
      return user;
    } else {
      return this.userRepository.findOneOrFail({
        where: [...values.map(v => ({ [v.name]: v.alias, role: Not(UserRoles.ADMIN) }))],
        relations: []
      });
    }
  }

  async create(user: CreateUserDTO) {
    let institution = await this.institutionRepository.findOne({ where: { id: user.teacherInstitution } });
    if (!institution) throw new Error(InstitutionErrors.institution_not_found);
    const createdUser = await this.userRepository.create({ ...user, teacherInstitution: institution, refreshToken: null });

    return this.userRepository.save(createdUser);
  }

  async updateUser(userId: string, data: InternalUpdateUserDTO, admin: boolean) {
    if (data.newPassword) {
      await this.authService.updatePassword(data);
    }

    console.log(data);

    delete data.id;
    delete data.oldPassword;
    delete data.newPassword;

    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    if (Object.keys(data).length > 0) {
      return this.update(userId, data as unknown as Partial<User>);
    } else {
      return this.get(undefined, userId, undefined, admin);
    }
  }

  async update(userId: string, data: Partial<User>) {
    // console.log("data");
    // console.log(data);
    return this.userRepository.update({ id: userId }, data);
  }

  async delete(id: string) {
    return this.userRepository.delete({ id });
  }

  async clearTable() {
    return this.userRepository.delete({});
  }

  async createAdmin(user: CreateUserDTO) {
    let institution = await this.institutionRepository.findOne({ where: { id: user.teacherInstitution } });
    if (!institution) throw new Error(InstitutionErrors.institution_not_found);

    await this.userRepository.create({ ...user, teacherInstitution: institution, role: UserRoles.ADMIN, refreshToken: null });
  }

  async addAvatar(userId: string, imageBuffer: Buffer, filename: string) {
    const user = await this.get(undefined, userId, undefined, true);
    const avatar = await this.databaseFileService.uploadDatabaseFile(imageBuffer, filename);
    await this.userRepository.update(userId, { avatarId: avatar.id });

    try {
      if (user.avatarId) {
        await this.databaseFileService.deteleFileById(user.avatarId);
      }
    } catch (error) {
      await this.userRepository.update(userId, { avatarId: null });
    }

    return avatar;
  }
}
