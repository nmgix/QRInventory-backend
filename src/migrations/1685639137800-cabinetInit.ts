import { MigrationInterface, QueryRunner } from "typeorm";
import { Institution } from "../modules/institution/institution.entity";
import { Item } from "../modules/item/item.entity";
import { User } from "../modules/user/user.entity";
import { Cabinet } from "../modules/cabinet/cabinet.entity";

export class CabinetInit1685639137800 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const institution = await queryRunner.manager.findOne(Institution, {
      where: { id: "4be12118-e771-4000-b448-9fd09791f763" }
    });
    const item = await queryRunner.manager.findOne(Item, {
      where: { id: "67ff5345-9e24-45c7-9efa-c5e35eaf3d05" }
    });
    const teacher = await queryRunner.manager.findOne(User, {
      where: { email: "ziminae@moskbt.ru" }
    });

    const cabinet = queryRunner.manager.create(Cabinet, {
      cabinetNumber: "414",
      id: "882503b7-03c7-4114-b6a2-3fcd9f1a3e77",
      institution,
      items: [item],
      teachers: [teacher]
    });
    await queryRunner.manager.save(Cabinet, cabinet);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const cabinet = await queryRunner.manager.findOne(Cabinet, {
      where: { id: "882503b7-03c7-4114-b6a2-3fcd9f1a3e77" }
    });
    await queryRunner.manager.remove(cabinet);
  }
}
