import { INestApplication } from "@nestjs/common/interfaces";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule, TypeOrmTestingModule } from "../database/database.module";
import { CreateUserDTO } from "./user.entity";
import { UserService } from "./user.service";
import { AppModule } from "../app/app.module";
import * as request from "supertest";
import { ConfigService } from "@nestjs/config";

describe("E2E учителей / администраторов", () => {
  let app: INestApplication;
  let service: UserService;
  let apiUrl;

  const teacherMockup: CreateUserDTO = {
    email: "test@mail.com",
    fullName: {
      surname: "Фамилия",
      name: "Имя",
      patronymic: "Отчество"
    },
    password: "default-password"
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = module.createNestApplication();
    await app.init();
    const configService: ConfigService = app.get(ConfigService);
    apiUrl = `http://localhost:${configService.get("NODE_ENV") === "development" ? configService.get("APP_PORT") : configService.get("GLOBAL_PORT")}`;

    service = module.get<UserService>(UserService);
    await service.clearTable();
  });

  afterEach(async () => {
    await service.clearTable();
  });

  it("Создание учителя неверными данными DTO", async () => {
    const newFullName = new Date();
    const newPassword = 0;
    const newUser = { fullName: newFullName, password: newPassword } as unknown as CreateUserDTO;
    const res = await request(apiUrl).post("/user/create").send(newUser).set("Content-Type", "application/json").set("Accept", "*/*");
    expect(res.status).toBe(422);
  });

  it("Создание учителя", async () => {
    const createResponse = await request(apiUrl).post("/user/create").send(teacherMockup).set("Content-Type", "application/json");
    const foundResponse = await request(apiUrl).get(`/user/${createResponse.body.id}`);
    expect(createResponse.body).toStrictEqual(foundResponse.body);
  });
});
