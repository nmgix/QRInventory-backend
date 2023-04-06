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

  get(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(user: CreateUserDTO) {
    const createdUser = await this.userRepository.create({ ...user, role: UserRoles.TEACHER });

    return this.userRepository.save(createdUser);
  }

  async delete(id: string) {
    return await this.userRepository.delete({ id });
  }

  async clearTable() {
    return await this.userRepository.delete({});
  }
}
