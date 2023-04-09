import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDTO, User, UserRoles } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  getAllTeachers() {
    return this.userRepository.find({ where: { role: UserRoles.TEACHER } });
  }

  get(email?: string, id?: number) {
    return this.userRepository.findOne({ where: { email, id } });
  }

  async create(user: CreateUserDTO) {
    const createdUser = await this.userRepository.create({ ...user, role: UserRoles.TEACHER, refreshToken: null });

    return this.userRepository.save(createdUser);
  }

  async update(userId: number, data: Partial<User>) {
    return this.userRepository.update({ id: userId }, data);
  }

  async delete(id: number) {
    return this.userRepository.delete({ id });
  }

  async clearTable() {
    return this.userRepository.delete({});
  }

  async createAdmin(user: CreateUserDTO) {
    await this.userRepository.create({ ...user, role: UserRoles.ADMIN, refreshToken: null });
  }
}
