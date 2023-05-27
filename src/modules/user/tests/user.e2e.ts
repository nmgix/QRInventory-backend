// import { INestApplication } from "@nestjs/common/interfaces";
// import { Test, TestingModule } from "@nestjs/testing";
// import { CreateUserDTO, User, UserRoles } from "../user.entity";
// import { UserService } from "../user.service";
// import { AppModule } from "../../app/app.module";
// import * as request from "supertest";
// import { ConfigService } from "@nestjs/config";
// import { AuthService } from "../../auth/auth.service";
// import { NodeENV } from "../../../helpers/types";

// describe("E2E учителей / администраторов", () => {
//   let app: INestApplication;
//   let apiUrl: string;
//   let agent: request.SuperAgentTest;
//   let userService: UserService;
//   let authService: AuthService;
//   let user: Omit<User, "password">;

//   const adminUser: CreateUserDTO = {
//     email: "adminUser@mail.com",
//     fullName: "test-fio",
//     password: "any-password"
//   };

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
//     userService = module.get<UserService>(UserService);
//     authService = module.get<AuthService>(AuthService);

//     apiUrl = `http://localhost:${configService.get("APP_PORT")}`;
//     agent = request.agent(apiUrl);

//     await userService.clearTable();

//     await authService.register({ ...adminUser, role: UserRoles.ADMIN });
//     const res = await agent.post("/auth/login").send({ email: adminUser.email, password: adminUser.password }).set("Content-Type", "application/json").set("Accept", "*/*");
//     user = res.body;
//   });

//   afterEach(async () => {
//     await userService.clearTable();
//   });

//   it("Создание учителя", async () => {
//     const createResponse = await agent.post("/user/create").send(testUser).set("Content-Type", "application/json");
//     const foundResponse = await agent.get(`/user/${createResponse.body.id}`);
//     expect(createResponse.body).toStrictEqual(foundResponse.body);
//   });

//   it("Создание учителя другим учителем вернёт ошибку", async () => {
//     await agent.get("/auth/logout");

//     await authService.register({ ...testUser });
//     const res = await agent.post("/auth/login").send({ email: testUser.email, password: testUser.password }).set("Content-Type", "application/json").set("Accept", "*/*");
//     user = res.body;

//     const testTeacher: CreateUserDTO = {
//       email: "randomTeacher@mail.com",
//       fullName: "test-fio",
//       password: "any-password"
//     };

//     const createResponse = await agent.post("/user/create").send(testTeacher).set("Content-Type", "application/json").set("Accept", "*/*");
//     expect(createResponse.status).toBe(500);
//   });

//   it("Создание учителя неверными данными DTO", async () => {
//     const newFullName = new Date();
//     const newPassword = 0;
//     const newUser = { fullName: newFullName, password: newPassword } as unknown as CreateUserDTO;
//     const res = await agent.post("/user/create").send(newUser).set("Content-Type", "application/json").set("Accept", "*/*");
//     expect(res.status).toBe(422);
//   });
// });
