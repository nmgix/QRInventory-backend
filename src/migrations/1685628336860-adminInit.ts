import { User, UserRoles } from "../modules/user/user.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AdminInit1685628336860 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const admin = queryRunner.manager.create(User, {
      email: process.env.TEST_ADMIN_MAIL,
      password: process.env.TEST_ADMIN_PASSWORD,
      id: "8b7c86bc-b8d8-4a7d-8805-89f956fb25d8",
      role: UserRoles.ADMIN,
      fullName: "Фамилия Имя Отчество"
    });
    await queryRunner.manager.insert(User, admin);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
