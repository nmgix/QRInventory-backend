import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository, UpdateResult } from "typeorm";
import { AuthService } from "../auth/auth.service";
import { CreateUserDTO, InternalUpdateUserDTO, User, UserRoles } from "./user.entity";
import { ImageService } from "../database/image.service";
import { Institution } from "modules/institution/institution.entity";
import { InstitutionErrors } from "modules/institution/institution.i18n";
import { ImageErrors } from "modules/database/image.i18n";
import { UserErrors } from "./user.i18n";

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
    let institution = await this.institutionRepository.findOne({
      where: { id: teacherInstitution }
    });
    if (!institution) throw new Error(InstitutionErrors.institution_not_found);
    return this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.teacherInstitution", "institution")
      .where("user.teacherInstitution.id = :teacherInstitution", { teacherInstitution })
      .orderBy("user.fullName", "ASC")
      .offset(skip)
      .limit(take)
      .getManyAndCount();
  }

  async get(institutionId?: string, take?: number, skip?: number, email?: string, id?: string, fio?: string, admin?: boolean) {
    if (admin) {
      if (id) {
        const user = await this.userRepository.findOne({
          where: { id },
          relations: ["institution", "teacherInstitution"]
        });
        return [[user], 1];
      } else {
        let result = await this.userRepository
          .createQueryBuilder("user")
          .leftJoinAndSelect("user.institutions", "institution")
          .leftJoinAndSelect("user.teacherInstitution", "teacherInstitution")
          .where(
            institutionId
              ? "(user.email LIKE :email OR user.fullName LIKE :fullName) AND (teacherInstitution.id = :institutionId OR institution.id = :institutionId)"
              : "user.email LIKE :email OR user.fullName LIKE :fullName",
            { email: `%${email}%`, fullName: `%${fio}%`, institutionId }
          )
          .offset(id ? 1 : skip ? skip : 0)
          .limit(id ? 1 : take ? take : 10)
          .orderBy("user.fullName", "ASC")
          .getManyAndCount();

        return [
          result[0].map(u => {
            if (u.role !== UserRoles.ADMIN) delete u.institutions;
            return u;
          }),
          result[1]
        ];
      }
    } else {
      if (id) {
        const user = await this.userRepository.findOne({
          where: { id, role: Not(UserRoles.ADMIN) },
          relations: ["teacherInstitution"]
        });
        return [[user], 1];
      } else {
        return this.userRepository
          .createQueryBuilder("user")
          .leftJoinAndSelect("user.teacherInstitution", "teacherInstitution")
          .where(
            institutionId
              ? "((user.email LIKE :email OR user.fullName LIKE :fullName) AND user.role != :role) AND teacherInstitution.id = :institutionId"
              : "(user.email LIKE :email OR user.fullName LIKE :fullName) AND user.role != :role",
            {
              email: `%${email}%`,
              fullName: `%${fio}%`,
              role: UserRoles.ADMIN,
              institutionId
            }
          )
          .offset(id ? 1 : skip ? skip : 0)
          .limit(id ? 1 : take ? take : 10)
          .orderBy("user.fullName", "ASC")
          .getManyAndCount();
      }
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
    let institution = await this.institutionRepository.findOne({
      where: { id: user.teacherInstitution }
    });
    if (!institution) throw new Error(InstitutionErrors.institution_not_found);
    const createdUser = await this.userRepository.create({
      ...user,
      teacherInstitution: institution,
      refreshToken: null
    });

    return this.userRepository.save(createdUser);
  }

  async updateUser(userId: string, data: InternalUpdateUserDTO, role: UserRoles) {
    if (data.newPassword) {
      await this.authService.updatePassword(data);
    }

    delete data.id;
    delete data.oldPassword;
    delete data.newPassword;

    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    if (Object.keys(data).length > 0) {
      let foundUser = await this.getById(userId, true);
      if (
        !foundUser ||
        (foundUser.id !== userId && role !== UserRoles.ADMIN) ||
        (foundUser.id !== userId && role === UserRoles.ADMIN && foundUser.role === UserRoles.ADMIN)
      )
        return { affected: 0 } as UpdateResult;
      return this.update(userId, data as unknown as Partial<User>);
    } else {
      return { affected: 0 } as UpdateResult;
    }
  }

  async update(userId: string, data: Partial<User>) {
    return this.userRepository.update({ id: userId }, data);
  }

  async delete(id: string) {
    return this.userRepository.delete({ id });
  }

  async addAvatar(userId: string, imageBuffer?: Buffer, filename?: string) {
    const user = await this.getById(userId, true);
    if (!user) throw new Error(UserErrors.user_not_found);

    if (!imageBuffer) {
      try {
        await this.userRepository.update(user.id, { avatarId: null });
        await this.imageService.deteleImageById(user.avatarId);
      } catch (error) {}

      return;
    }

    try {
      const avatar = await this.imageService.uploadImage(imageBuffer, filename);
      await this.userRepository.update(userId, { avatarId: avatar.id });
      if (user.avatarId) {
        await this.imageService.deteleImageById(user.avatarId);
      }
      return avatar;
    } catch (error) {
      await this.userRepository.update(userId, { avatarId: null });
      throw new Error(ImageErrors.image_upload_error);
    }
  }
}
