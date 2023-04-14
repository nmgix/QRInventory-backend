import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDTO, User, UserRoles } from "./user.entity";
import { UserErrors } from "./user.i18n";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  getAllTeachers() {
    return this.userRepository.find({ where: { role: UserRoles.TEACHER } });
  }

  async get(email?: string, id?: string, admin?: boolean) {
    return this.userRepository.findOne({ where: { email, id }, relations: admin ? ["institutions"] : [] });
  }

  async create(user: Partial<User>) {
    const createdUser = await this.userRepository.create({ ...user, role: user.role ?? UserRoles.TEACHER, refreshToken: null });
    return this.userRepository.save(createdUser);
  }

  async update(userId: string, data: Partial<User>) {
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
