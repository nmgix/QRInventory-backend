import { MigrationInterface, QueryRunner } from "typeorm";
import { Institution } from "../modules/institution/institution.entity";
import { User } from "../modules/user/user.entity";

export class InstitutionInit1685638902706 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const admin = await queryRunner.manager.findOne(User, {
      where: { email: process.env.TEST_ADMIN_MAIL }
    });

    const institution = queryRunner.manager.create(Institution, {
      id: "4be12118-e771-4000-b448-9fd09791f763",
      admin,
      cabinets: [],
      teachers: [],
      items: [],
      name: "КБТ"
    });
    await queryRunner.manager.insert(Institution, institution);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const institution = await queryRunner.manager.findOne(Institution, {
      where: { id: "4be12118-e771-4000-b448-9fd09791f763" }
    });
    await queryRunner.manager.remove(institution);
  }
}
