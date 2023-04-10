import { INestApplication } from "@nestjs/common/interfaces";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../app/app.module";
import * as request from "supertest";
import { ConfigService } from "@nestjs/config";
import { CabinetService } from "./cabinet.service";
import { Cabinet, CreateCabinetDTO, EditCabinetDTO } from "./cabinet.entity";
import { UserService } from "../user/user.service";
import { AuthController } from "../auth/auth.controller";
import { CreateUserDTO, User } from "../user/user.entity";

describe("E2E кабинетов", () => {
  let app: INestApplication;
  let cabinetService: CabinetService;
  let apiUrl: string;
  let agent: request.SuperAgentTest;
  let userService: UserService;
  let authController: AuthController;
  let user: Omit<User, "password">;

  const testUser: CreateUserDTO = {
    email: "randomUser@mail.com",
    fullName: { name: "test-name", patronymic: "test-patronymic", surname: "test-surname" },
    password: "any-password"
  };

  const cabinetMockup: CreateCabinetDTO = {
    cabinetNumber: 555
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = module.createNestApplication();
    await app.init();

    const configService: ConfigService = app.get(ConfigService);
    cabinetService = module.get<CabinetService>(CabinetService);
    authController = module.get<AuthController>(AuthController);
    userService = module.get<UserService>(UserService);

    apiUrl = `http://localhost:${configService.get("NODE_ENV") !== "production" ? configService.get("APP_PORT") : configService.get("GLOBAL_PORT")}`;
    agent = request.agent(apiUrl);

    await userService.clearTable();

    await authController.register(testUser);

    const res = await agent.post("/auth/login").send({ email: testUser.email, password: testUser.password }).set("Content-Type", "application/json").set("Accept", "*/*");
    user = res.body;

    await cabinetService.clearTable();
  });
  afterEach(async () => {
    await userService.delete(user.id);
    await cabinetService.clearTable();
  });

  it("Попытка изменения кабинета учителем, не находящимся в списке учителей кабинета закончится ошибкой", async () => {
    const createCabinetRes = await cabinetService.create(cabinetMockup);
    const editCabinetRes = await agent.post("/cabinet/edit").send({ id: createCabinetRes.id, cabinetNumber: 301 } as EditCabinetDTO);
    // console.log(editCabinetRes.body);
    expect(editCabinetRes.status).toBe(500);
  });

  it("Изменение существующего кабинета учителем", async () => {
    const createCabinetRes = await agent
      .post("/cabinet/create")
      .send({ ...cabinetMockup })
      .set("Content-Type", "application/json")
      .set("Accept", "*/*");
    const editCabinetRes = await agent.post("/cabinet/edit").send({ id: createCabinetRes.body.id, cabinetNumber: 301 } as EditCabinetDTO);
    expect(editCabinetRes.status).toBe(200);
    const teacher = (editCabinetRes.body as Cabinet).teachers[0];
    expect(teacher.id).toBe(user.id);
  });
});
