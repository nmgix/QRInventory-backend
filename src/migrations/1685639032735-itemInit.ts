import { MigrationInterface, QueryRunner } from "typeorm";
import { Institution } from "../modules/institution/institution.entity";
import { Item } from "../modules/item/item.entity";

export class ItemInit1685639032735 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const institution = await queryRunner.manager.findOne(Institution, {
      where: { id: "4be12118-e771-4000-b448-9fd09791f763" }
    });

    const item = queryRunner.manager.create(Item, {
      institution,
      article: "Ш-504",
      id: "67ff5345-9e24-45c7-9efa-c5e35eaf3d05",
      name: "Стул обыкновенный"
    });
    await queryRunner.manager.insert(Item, item);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const item = await queryRunner.manager.findOne(Item, {
      where: { id: "67ff5345-9e24-45c7-9efa-c5e35eaf3d05" }
    });
    await queryRunner.manager.remove(item);
  }
}
