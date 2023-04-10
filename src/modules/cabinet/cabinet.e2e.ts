import { INestApplication } from "@nestjs/common/interfaces";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../app/app.module";
import * as request from "supertest";
import { ConfigService } from "@nestjs/config";
import { CabinetService } from "./cabinet.service";
import { Cabinet, CreateCabinetDTO, EditCabinetDTO } from "./cabinet.entity";
import { UserService } from "../user/user.service";
import { AuthController } from "../auth/auth.controller";
import { CreateUserDTO, User, UserRoles } from "../user/user.entity";
import { AuthService } from "../auth/auth.service";

describe("E2E кабинетов", () => {
  let app: INestApplication;
  let cabinetService: CabinetService;
  let apiUrl: string;
  let agent: request.SuperAgentTest;
  let userService: UserService;
  let authController: AuthController;
  let user: Omit<User, "password">;
  let authSevice: AuthService;

  const adminUser: CreateUserDTO = {
    email: "adminUser@mail.com",
    fullName: { name: "test-name", patronymic: "test-patronymic", surname: "test-surname" },
    password: "any-password"
  };

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
    authSevice = module.get<AuthService>(AuthService);

    apiUrl = `http://localhost:${configService.get("NODE_ENV") !== "production" ? configService.get("APP_PORT") : configService.get("GLOBAL_PORT")}`;
    agent = request.agent(apiUrl);

    await userService.clearTable();
    await authController.register(testUser);

    const res = await agent.post("/auth/login").send({ email: testUser.email, password: testUser.password }).set("Content-Type", "application/json").set("Accept", "*/*");
    user = res.body;

    await cabinetService.clearTable();
  });
  afterEach(async () => {
    await userService.clearTable();

    await cabinetService.clearTable();
  });

  describe("Редактирование кабинетов", () => {
    it("Попытка изменения кабинета учителем, не находящимся в списке учителей кабинета закончится ошибкой", async () => {
      const cabinet = await cabinetService.create(cabinetMockup);
      const editCabinetRes = await agent.post("/cabinet/edit").send({ id: cabinet.id, cabinetNumber: 2 } as EditCabinetDTO);
      expect(editCabinetRes.status).toBe(500);
    });

    it("Изменение существующего кабинета учителем", async () => {
      const createCabinetRes = await agent.post("/cabinet/create").send(cabinetMockup).set("Content-Type", "application/json").set("Accept", "*/*");
      const editCabinetRes = await agent.post("/cabinet/edit").send({ id: createCabinetRes.body.id, cabinetNumber: 301 } as EditCabinetDTO);
      expect(editCabinetRes.status).toBe(200);
      const teacher = (editCabinetRes.body as Cabinet).teachers[0];
      expect(teacher.id).toBe(user.id);
    });

    it("Редактирование любой комнаты администратором", async () => {
      await agent.get("/auth/logout");

      await authSevice.register({ ...adminUser, role: UserRoles.ADMIN });
      const res = await agent.post("/auth/login").send({ email: adminUser.email, password: adminUser.password }).set("Content-Type", "application/json").set("Accept", "*/*");
      user = res.body;

      let testTeacher = await userService.get(testUser.email);

      let cabinetRes1 = await agent
        .post("/cabinet/create")
        .send({ cabinetNumber: 1 } as CreateCabinetDTO)
        .set("Content-Type", "application/json")
        .set("Accept", "*/*");

      let cabinetRes2 = await agent
        .post("/cabinet/create")
        .send({ cabinetNumber: 2 } as CreateCabinetDTO)
        .set("Content-Type", "application/json")
        .set("Accept", "*/*");

      let cabinetRes3 = await agent
        .post("/cabinet/create")
        .send({ cabinetNumber: 3, teachers: [String(testTeacher.id)] } as CreateCabinetDTO)
        .set("Content-Type", "application/json")
        .set("Accept", "*/*");

      const editCabinetRes1 = await agent
        .post("/cabinet/edit")
        .send({ id: cabinetRes1.body.id, cabinetNumber: cabinetRes1.body.cabinetNumber, teachers: [String(testTeacher.id)] } as EditCabinetDTO)
        .set("Content-Type", "application/json")
        .set("Accept", "*/*");
      expect(editCabinetRes1.status).toBe(200);

      const editCabinetRes2 = await agent
        .post("/cabinet/edit")
        .send({ id: cabinetRes2.body.id, cabinetNumber: 4, teachers: [String(testTeacher.id)] } as EditCabinetDTO)
        .set("Content-Type", "application/json")
        .set("Accept", "*/*");
      expect(editCabinetRes2.status).toBe(200);
      expect(editCabinetRes2.body.cabinetNumber).toBe(4);
      const teacher2 = (editCabinetRes2.body as Cabinet).teachers[0];
      expect(teacher2.id).toBe(testTeacher.id);

      const editCabinetRes3 = await agent
        .post("/cabinet/edit")
        .send({ id: cabinetRes3.body.id, cabinetNumber: cabinetRes2.body.cabinetNumber, teachers: [] } as EditCabinetDTO)
        .set("Content-Type", "application/json")
        .set("Accept", "*/*");
      expect(editCabinetRes3.status).toBe(200);
      const teachers3 = (editCabinetRes3.body as Cabinet).teachers;
      expect(teachers3.length).toBe(0);
    });
  });

  describe("Удаление кабинетов", () => {
    it("Попытка удаления кабинета учителем не из этого кабинета", async () => {
      const cabinet = await cabinetService.create(cabinetMockup);
      const deleteCabinetRes = await agent.delete(`/cabinet/${cabinet.id}`);
      expect(deleteCabinetRes.status).toBe(500);
    });

    it("Удаление кабинета учителем из этого кабинета", async () => {
      const createCabinetRes = await agent.post("/cabinet/create").send(cabinetMockup).set("Content-Type", "application/json").set("Accept", "*/*");
      const deleteCabinetRes = await agent.delete(`/cabinet/${createCabinetRes.body.id}`);
      expect(deleteCabinetRes.status).toBe(200);
    });

    it("Удаление кабинета администратором", async () => {
      await agent.get("/auth/logout");

      await authSevice.register({ ...adminUser, role: UserRoles.ADMIN });
      const res = await agent.post("/auth/login").send({ email: adminUser.email, password: adminUser.password }).set("Content-Type", "application/json").set("Accept", "*/*");
      user = res.body;

      let cabinet1 = await agent
        .post("/cabinet/create")
        .send({ cabinetNumber: 1 } as CreateCabinetDTO)
        .set("Content-Type", "application/json")
        .set("Accept", "*/*");
      await agent
        .post("/cabinet/create")
        .send({ cabinetNumber: 2 } as CreateCabinetDTO)
        .set("Content-Type", "application/json")
        .set("Accept", "*/*");
      await agent
        .post("/cabinet/create")
        .send({ cabinetNumber: 3 } as CreateCabinetDTO)
        .set("Content-Type", "application/json")
        .set("Accept", "*/*");

      await agent.delete(`/cabinet/${cabinet1.body.id}`);
      const cabinets = await cabinetService.getAll();

      expect(cabinets.length).toBe(2);
    });
  });
});
