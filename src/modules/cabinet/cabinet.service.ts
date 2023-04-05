import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Cabinet } from './cabinet.entity';

@Injectable()
export class CabinetService {
  constructor(
    @InjectRepository(Cabinet)
    private cabinetRepository: Repository<Cabinet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(cabinet: Cabinet) {
    const createdCabinet = await this.cabinetRepository.create(cabinet);

    return await this.cabinetRepository.save(createdCabinet);
  }

  async get(id: string) {
    return await this.cabinetRepository.findOne({ where: { id } });
  }

  async addTeachers(teachersId: string[], cabinetId: string) {
    const cabinet = await this.cabinetRepository.findOne({
      where: { id: cabinetId },
    });
    const teachers = await this.userRepository.findBy({ id: In(teachersId) });
    cabinet.teachers = cabinet.teachers.concat(
      teachers.filter(
        (teacher) =>
          !cabinet.teachers.find((c_teacher) => c_teacher.id === teacher.id),
      ),
    );
    return await this.cabinetRepository.save(cabinet);
  }

  async removeTeachers(teachersId: string[], cabinetId: string) {
    const cabinet = await this.cabinetRepository.findOne({
      where: { id: cabinetId },
    });

    // console.log(cabinet.teachers);

    cabinet.teachers = cabinet.teachers.filter(
      (teacher) => !teachersId.includes(teacher.id),
    );
    return await this.cabinetRepository.save(cabinet);
  }
}
