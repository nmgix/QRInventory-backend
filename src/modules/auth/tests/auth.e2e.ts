// import { INestApplication } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { Test, TestingModule } from "@nestjs/testing";
// import { AppModule } from "../../app/app.module";
// import * as request from "supertest";
// import { CreateUserDTO, User } from "../../user/user.entity";
// import { CabinetService } from "../../cabinet/cabinet.service";
// import { UserService } from "../../user/user.service";
// import { AuthController } from "../auth.controller";
// import { Tokens } from "../types";
// import { AuthService } from "../auth.service";
// import { NodeENV } from "../../../helpers/types";

// describe("Авторизация и получение пользователя", () => {
//   let app: INestApplication;
//   let cabinetService: CabinetService;
//   let apiUrl: string;
//   let agent: request.SuperAgentTest;
//   let userService: UserService;
//   let authController: AuthController;
//   let authService: AuthService;
//   let user: Omit<User, "password">;

//   const testUser: CreateUserDTO = {
//     email: "randomUser@mail.com",
//     fullName: "test-fio",
//     password: "any-password"
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [AppModule]
//     }).compile();

//     app = module.createNestApplication();
//     await app.init();

//     const configService: ConfigService = app.get(ConfigService);
//     cabinetService = module.get<CabinetService>(CabinetService);
//     authController = module.get<AuthController>(AuthController);
//     userService = module.get<UserService>(UserService);
//     authService = module.get<AuthService>(AuthService);

//     apiUrl = `http://localhost:${configService.get("APP_PORT")}`;
//     agent = request.agent(apiUrl);

//     await userService.clearTable();
//     await cabinetService.clearTable();

//     await authController.register(testUser);
//     const res = await agent.post("/auth/login").send({ email: testUser.email, password: testUser.password }).set("Content-Type", "application/json").set("Accept", "*/*");
//     user = res.body;
//   });
//   afterEach(async () => {
//     await userService.clearTable();
//     await cabinetService.clearTable();
//   });

//   it("Получить пользователь можно только после авторизации", async () => {
//     await agent.get("/auth/logout");
//     const getUserErrorRes = await agent.get("/user");
//     expect(getUserErrorRes.status).toBe(500);

//     const res = await agent.post("/auth/login").send({ email: testUser.email, password: testUser.password }).set("Content-Type", "application/json").set("Accept", "*/*");
//     user = res.body;

//     const getUserSuccessRes = await agent.get("/user");
//     expect(getUserSuccessRes.status).toBe(200);
//     expect(getUserSuccessRes.body.id).toBe(user.id);
//   });

//   it("После удаления куки access-token (expired), создаётся новая пара токенов", async () => {
//     // и возвращается с любым запросом (который с защитой)
//     await agent.get("/auth/clean-cookies").send({ tokens: [Tokens.access_token] });
//     const getUserAfterAccessDeleteSuccessRes = await agent.get("/user");
//     user = getUserAfterAccessDeleteSuccessRes.body;
//     expect(getUserAfterAccessDeleteSuccessRes.status).toBe(200);
//     expect(getUserAfterAccessDeleteSuccessRes.body.id).toBe(user.id);
//   });
// });
