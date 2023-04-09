import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../app/app.module";
import * as request from "supertest";
import { User } from "../user/user.entity";

describe("AuthController", () => {
  let app: INestApplication;
  let apiUrl;
  let user: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = module.createNestApplication();
    await app.init();
    const configService: ConfigService = app.get(ConfigService);
    apiUrl = `http://localhost:${configService.get("NODE_ENV") !== "production" ? configService.get("APP_PORT") : configService.get("GLOBAL_PORT")}`;

    const response = await request(apiUrl).post("/auth/login").send({ email: "test@mail.com", password: "any-password" });
    user = response.body;
  });
});
