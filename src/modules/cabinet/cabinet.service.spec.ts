import { CabinetService } from './cabinet.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingModule } from '../database/database.module';
import { CreateCabinetDTO } from './cabinet.entity';

describe('Сервис кабинета', () => {
  let service: CabinetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingModule()],
      providers: [CabinetService],
    }).compile();

    service = module.get<CabinetService>(CabinetService);
    await service.clearTable();
  });

  describe('Должен создаваться кабинет', () => {
    it('Кабинет должен создаться', async () => {
      const cabinetMockup: CreateCabinetDTO = {
        cabinetNumber: 300,
      };

      const cabinet = await service.create(cabinetMockup);
      const foundCabinet = await service.get(cabinet.id);

      expect(cabinet).toStrictEqual(foundCabinet);
    });
  });

  afterEach(async () => {
    await service.clearTable();
  });
});
