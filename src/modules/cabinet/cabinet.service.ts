import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Cabinet, CreateCabinetDTO, EditCabinetDTO } from './cabinet.entity';
import { CabinetErrors } from './cabinet.i18n';

@Injectable()
export class CabinetService {
  constructor(
    @InjectRepository(Cabinet)
    private cabinetRepository: Repository<Cabinet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateCabinetDTO) {
    let cabinet: Cabinet = { ...dto } as unknown as Cabinet;

    if (dto.teachers) {
      const teachers = await this.userRepository.findBy({
        id: In(dto.teachers),
      });
      cabinet.teachers = teachers;
    }

    const createdCabinet = await this.cabinetRepository.create(cabinet);
    await this.cabinetRepository.save(createdCabinet);

    return this.get(createdCabinet.id);
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

    if (!cabinet) {
      throw new Error(CabinetErrors.cabinet_not_found);
    }

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

  async clearTable() {
    return await this.cabinetRepository.delete({});
  }
}
