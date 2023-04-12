import { CabinetService } from "../cabinet.service";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmTestingModule } from "../../database/database.module";
import { Cabinet, CreateCabinetDTO, EditCabinetDTO } from "../cabinet.entity";
import { QueryFailedError } from "typeorm";

describe("Сервис кабинета", () => {
  let service: CabinetService;

  const cabinetMockup: CreateCabinetDTO = {
    cabinetNumber: 300
  };

  const createCabinet = async (dto: CreateCabinetDTO) => {
    return service.create(dto);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingModule()],
      providers: [CabinetService]
    }).compile();

    service = module.get<CabinetService>(CabinetService);
    await service.clearTable();
  });

  afterEach(async () => {
    await service.clearTable();
  });

  it("Кабинет должен создаться", async () => {
    const cabinet = await createCabinet(cabinetMockup);
    const foundCabinet = await service.get(cabinet.id);

    expect(cabinet).toStrictEqual(foundCabinet);
  });

  it("Создание кабинета с таким-же номером должно выбросить ошибку", async () => {
    await createCabinet(cabinetMockup);
    await expect(createCabinet(cabinetMockup)).rejects.toThrow(QueryFailedError);
  });

  it("Пустой DTO выбросит ошибку при создании", async () => {
    await expect(createCabinet({})).rejects.toThrow(QueryFailedError);
  });

  it("Получение всех кабинетов", async () => {
    await createCabinet({ cabinetNumber: 300 });
    await createCabinet({ cabinetNumber: 301 });
    await createCabinet({ cabinetNumber: 303 });

    const cabinets = await service.getAll();

    expect(cabinets.length).toBe(3);
  });

  // пока что без учителей и вещей

  describe("Изменение кабинета", () => {
    it("Изменение номера кабинета", async () => {
      let newCabinetNumber = 301;

      let cabinet = await createCabinet(cabinetMockup);
      expect(cabinet).toBeInstanceOf(Cabinet);

      cabinet = await service.update({
        ...cabinet,
        cabinetNumber: newCabinetNumber
      } as unknown as EditCabinetDTO);
      expect(cabinet.cabinetNumber).toBe(newCabinetNumber);
    });

    it("Ошибка при неправильном типе учителей в DTO", async () => {
      let teachers = [new Date()];

      const cabinet = await createCabinet(cabinetMockup);
      expect(cabinet).toBeInstanceOf(Cabinet);

      await expect(
        service.update({
          ...cabinet,
          teachers
        } as unknown as EditCabinetDTO)
      ).rejects.toThrow(QueryFailedError);
    });

    it("Ошибка при неправильном номере кабинета", async () => {
      let newCabinetNumber = new Date();

      const cabinet = await createCabinet(cabinetMockup);
      expect(cabinet).toBeInstanceOf(Cabinet);

      await expect(
        service.update({
          ...cabinet,
          cabinetNumber: newCabinetNumber
        } as unknown as EditCabinetDTO)
      ).rejects.toThrow(QueryFailedError);
    });
  });

  it("Удаление кабинета", async () => {
    const cabinet = await createCabinet(cabinetMockup);
    expect(cabinet).toBeInstanceOf(Cabinet);

    await service.delete(cabinet.id);
    expect(await service.get(cabinet.id)).toBe(null);
  });

  describe("Проверки на несуществующий кабинет", () => {
    it("Пустой id выдаст ошибку", async () => {
      await expect(service.get("")).rejects.toThrow(QueryFailedError);
    });

    it("Несуществующий id будет равен null", async () => {
      const cabinet = await service.get("48bd876c-6b9e-4bd9-a6e6-f480494d456d");
      expect(cabinet).toBe(null);
    });
  });
});
