import { INestApplication } from "@nestjs/common/interfaces";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule, TypeOrmTestingModule } from "../database/database.module";
import { AppModule } from "../app/app.module";
import * as request from "supertest";
import { ConfigService } from "@nestjs/config";
import { CabinetService } from "./cabinet.service";
import { Cabinet, CreateCabinetDTO, EditCabinetDTO } from "./cabinet.entity";

describe("E2E кабинетов", () => {
  let app: INestApplication;
  let service: CabinetService;
  let apiUrl;

  const cabinetMockup: CreateCabinetDTO = {
    cabinetNumber: 300
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(DatabaseModule)
      .useValue(TypeOrmTestingModule)
      .compile();

    app = module.createNestApplication();
    await app.init();
    const configService: ConfigService = app.get(ConfigService);
    apiUrl = `http://localhost:${configService.get("NODE_ENV") === "development" ? configService.get("APP_PORT") : configService.get("GLOBAL_PORT")}`;

    service = module.get<CabinetService>(CabinetService);
    await service.clearTable();
  });

  afterEach(async () => {
    await service.clearTable();
  });

  it("Изменение существующего кабинета учителем", async () => {
    // тут ещё авторизация должна быть
    const createCabinetRes = await request(apiUrl).post("/cabinet/create").send(cabinetMockup).set("Content-Type", "application/json").set("Accept", "*/*");
    expect(createCabinetRes.body).toBeInstanceOf(Cabinet);
    const editCabinetRes = await request(apiUrl)
      .put("/cabinet/edit")
      .send({ id: createCabinetRes.body.id, cabinetNumber: 301 } as EditCabinetDTO);
    expect(editCabinetRes.status).toBe(201);
  });
});
