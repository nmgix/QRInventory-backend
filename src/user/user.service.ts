import { Catch, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TypeORMError } from 'typeorm';
import { User, UserRoles } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  getAllTeachers() {
    return this.userRepository.find({ where: { role: UserRoles.TEACHER } });
  }

  find(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(user: User) {
    const createdUser = await this.userRepository.create({
      ...user,
      role: UserRoles.TEACHER,
    });

    return this.userRepository.save(createdUser);
  }

  async delete(id: string) {
    return await this.userRepository.delete({ id });
  }
}
