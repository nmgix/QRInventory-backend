import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Cabinet, EditCabinetDTO } from './cabinet.entity';

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

  async getAll() {
    return await this.cabinetRepository.find();
  }

  async update(dto: EditCabinetDTO): Promise<Cabinet | null> {
    const cabinet = await this.cabinetRepository.findOne({
      where: { id: dto.id },
    });

    if (!cabinet) return null;

    if (dto.cabinetNumber) cabinet.cabinetNumber = dto.cabinetNumber;

    if (dto.teachers) {
      const teachers = await this.userRepository.findBy({
        id: In(dto.teachers),
      });
      cabinet.teachers = teachers;
    }

    return await this.cabinetRepository.save(cabinet);
  }

  async delete(id: string) {
    return await this.cabinetRepository.delete(id);
  }
}
