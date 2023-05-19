import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Not, Repository } from "typeorm";
import { AuthService } from "../auth/auth.service";
import { CreateUserDTO, InternalUpdateUserDTO, User, UserRoles } from "./user.entity";
import { ImageService } from "../database/image.service";
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
    private imageService: ImageService
  ) {}

  async getAllTeachers(teacherInstitution: string, take: number = 10, skip: number = 0) {
    if (!teacherInstitution) throw new BadRequestException(InstitutionErrors.institution_not_stated);
    let institution = await this.institutionRepository.findOne({ where: { id: teacherInstitution } });
    if (!institution) throw new Error(InstitutionErrors.institution_not_found);
    return this.userRepository.createQueryBuilder("user").leftJoinAndSelect("user.teacherInstitution", "institution").where("user.teacherInstitution.id = :teacherInstitution", { teacherInstitution }).offset(skip).limit(take).getManyAndCount();
  }

  async get(take?: number, skip?: number, email?: string, id?: string, fio?: string, admin?: boolean) {
    if (admin) {
      let result = await this.userRepository
        .createQueryBuilder("user")
        .where("user.email LIKE :email OR user.fullName LIKE :fullName OR user.id = :id", { id, email: `%${email}%`, fullName: `%${fio}%` })
        .leftJoinAndSelect("user.institutions", "institution")
        .leftJoinAndSelect("user.teacherInstitution", "teacherInstitution")
        .offset(id ? 1 : skip ? skip : 0)
        .limit(id ? 1 : take ? take : 10)
        .orderBy()
        .getManyAndCount();

      return [
        result[0].map(u => {
          if (u.role !== UserRoles.ADMIN) delete u.institutions;
          return u;
        }),
        result[1]
      ];
    } else {
      return this.userRepository
        .createQueryBuilder("user")
        .where("(user.email LIKE :email OR user.fullName LIKE :fullName OR user.id = :id) AND user.role != :role", { id, email: `%${email}%`, fullName: `%${fio}%`, role: UserRoles.ADMIN })
        .leftJoinAndSelect("user.teacherInstitution", "teacherInstitution")
        .offset(id ? 1 : skip ? skip : 0)
        .limit(id ? 1 : take ? take : 10)
        .orderBy()
        .getManyAndCount();
    }
  }

  async getById(id: string, admin?: boolean) {
    if (admin) {
      let user = await this.userRepository.findOneOrFail({
        where: { id: id },
        relations: ["institutions", "teacherInstitution"]
      });
      if (user.role !== UserRoles.ADMIN) delete user.institutions;
      return user;
    } else {
      return this.userRepository.findOneOrFail({
        where: { id: id, role: Not(UserRoles.ADMIN) },
        relations: ["teacherInstitution"]
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
      return this.getById(userId, admin);
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
    const user = await this.getById(userId, true);
    const avatar = await this.imageService.uploadImage(imageBuffer, filename);
    await this.userRepository.update(userId, { avatarId: avatar.id });

    try {
      if (user.avatarId) {
        await this.imageService.deteleImageById(user.avatarId);
      }
    } catch (error) {
      await this.userRepository.update(userId, { avatarId: null });
    }

    return avatar;
  }
}
