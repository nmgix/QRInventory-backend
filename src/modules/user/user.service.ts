import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthService } from "../auth/auth.service";
import { CreateUserDTO, InternalUpdateUserDTO, UpdateUserDTO, User, UserRoles } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService
  ) {}

  getAllTeachers() {
    return this.userRepository.find({ where: { role: UserRoles.TEACHER } });
  }

  async get(email?: string, id?: string, admin?: boolean) {
    return this.userRepository.findOne({ where: [{ email }, { id }], relations: admin ? ["institutions"] : [] });
  }

  async create(user: Partial<User>) {
    const createdUser = await this.userRepository.create({ ...user, role: user.role ?? UserRoles.TEACHER, refreshToken: null });
    return this.userRepository.save(createdUser);
  }

  async updateUser(userId: string, data: InternalUpdateUserDTO) {
    if (data.newPassword) {
      await this.authService.updatePassword(data);
    }

    delete data.id;
    delete data.oldPassword;
    delete data.newPassword;
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    if (Object.keys(data).length > 0) {
      return this.update(userId, data);
    } else {
      return this.get(undefined, userId);
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
    await this.userRepository.create({ ...user, role: UserRoles.ADMIN, refreshToken: null });
  }
}
