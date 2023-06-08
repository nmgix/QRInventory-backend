import { In, MigrationInterface, QueryRunner } from "typeorm";
import { Institution } from "../modules/institution/institution.entity";
import { User, UserRoles } from "../modules/user/user.entity";
const fs = require("fs");
// import fs from "fs";
import ImageFile from "../modules/database/image.entity";
import { Item } from "../modules/item/item.entity";
import { Cabinet } from "../modules/cabinet/cabinet.entity";

export class ClubInit1686215106442 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const admin = await queryRunner.manager.findOne(User, {
      where: { email: process.env.TEST_ADMIN_MAIL }
    });

    const institution = queryRunner.manager.create(Institution, {
      id: "3d04d62f-dc51-4032-8c2c-4d6b44a6bf72",
      admin,
      cabinets: [],
      teachers: [],
      items: [],
      name: "🤼🏾‍♂️🍆 Секретный клуб 💪🏻🍌"
    });
    await queryRunner.manager.insert(Institution, institution);

    // Fowarded from Artem Zimin
    // хоть поржем нормально, а то так скучно бывает на ваших защитах

    let clubleaderImage = fs.readFileSync(__dirname + "/../resources/secret-club/masters.png");
    let clubleaderImageFile = queryRunner.manager.create(ImageFile, {
      data: clubleaderImage as unknown as Buffer,
      filename: "clubleader.png"
    });
    await queryRunner.manager.insert(ImageFile, clubleaderImageFile);
    const clubleader = queryRunner.manager.create(User, {
      email: "clubleader@moskbt.ru",
      password: "$argon2id$v=19$m=65536,t=3,p=4$pYkYZ+EtAlE9FJoPp/nlKA$J26piDOVvau5IGjHQAbNz2RnRyQAuk/zdC7xGyioVwg",
      id: "84736973-c46c-465e-b978-f944ce4bbe9d",
      role: UserRoles.TEACHER,
      fullName: "Мастер",
      avatar: clubleaderImageFile,
      avatarId: clubleaderImageFile.id,
      teacherInstitution: institution
    });
    let security1Image = fs.readFileSync(__dirname + "/../resources/secret-club/security1.png");
    let security1ImageFile = queryRunner.manager.create(ImageFile, {
      data: security1Image as unknown as Buffer,
      filename: "security1.png"
    });
    await queryRunner.manager.insert(ImageFile, security1ImageFile);
    const security1 = queryRunner.manager.create(User, {
      email: "security1@moskbt.ru",
      password: "$argon2id$v=19$m=65536,t=3,p=4$xNS/ObsKm6UQneOcKdK42Q$TpH9YAE/9GVTJv15w2yfUZYUFizAgmMxzxRHOHlH5UQ",
      id: "9026a126-a3d4-4773-baa1-33d80ebb7758",
      role: UserRoles.TEACHER,
      avatar: security1ImageFile,
      avatarId: security1ImageFile.id,
      fullName: "Охранник 1",
      teacherInstitution: institution
    });
    let security2Image = fs.readFileSync(__dirname + "/../resources/secret-club/security2.png");
    let security2ImageFile = queryRunner.manager.create(ImageFile, {
      data: security2Image as unknown as Buffer,
      filename: "security2.png"
    });
    await queryRunner.manager.insert(ImageFile, security2ImageFile);
    const security2 = queryRunner.manager.create(User, {
      email: "security2@moskbt.ru",
      password: "$argon2id$v=19$m=65536,t=3,p=4$xNS/ObsKm6UQneOcKdK42Q$TpH9YAE/9GVTJv15w2yfUZYUFizAgmMxzxRHOHlH5UQ",
      id: "f6dda00a-879b-4468-a592-fb29da0de555",
      role: UserRoles.TEACHER,
      avatar: security2ImageFile,
      avatarId: security2ImageFile.id,
      fullName: "Охранник 2",
      teacherInstitution: institution
    });
    let slave1Image = fs.readFileSync(__dirname + "/../resources/secret-club/slave1.png");
    let slave1ImageFile = queryRunner.manager.create(ImageFile, {
      data: slave1Image as unknown as Buffer,
      filename: "slave1.png"
    });
    await queryRunner.manager.insert(ImageFile, slave1ImageFile);
    const slave1 = queryRunner.manager.create(User, {
      email: "slave1@moskbt.ru",
      password: "$argon2id$v=19$m=65536,t=3,p=4$AkDifaNYP7MpGXVURtMFKQ$lueOA/EeZJt/AqY3gCmYbN8neZvajT2EV33IYSlTpv8",
      id: "98ca780c-b5ef-4d09-8886-3612d688fa2e",
      role: UserRoles.TEACHER,
      avatar: slave1ImageFile,
      avatarId: slave1ImageFile.id,
      fullName: "Раб 1",
      teacherInstitution: institution
    });
    let slave2Image = fs.readFileSync(__dirname + "/../resources/secret-club/slave2.png");
    let slave2ImageFile = queryRunner.manager.create(ImageFile, {
      data: slave2Image as unknown as Buffer,
      filename: "slave2.png"
    });
    await queryRunner.manager.insert(ImageFile, slave2ImageFile);
    const slave2 = queryRunner.manager.create(User, {
      email: "slave2@moskbt.ru",
      password: "$argon2id$v=19$m=65536,t=3,p=4$AkDifaNYP7MpGXVURtMFKQ$lueOA/EeZJt/AqY3gCmYbN8neZvajT2EV33IYSlTpv8",
      id: "b78259bd-20b0-4b44-ae95-72a001cbbbf8",
      role: UserRoles.TEACHER,
      avatar: slave2ImageFile,
      avatarId: slave2ImageFile.id,
      fullName: "Раб 2",
      teacherInstitution: institution
    });
    let varmint1Image = fs.readFileSync(__dirname + "/../resources/secret-club/varmint1.jpg");
    let varmint1ImageFile = queryRunner.manager.create(ImageFile, {
      data: varmint1Image as unknown as Buffer,
      filename: "varmint1.png"
    });
    await queryRunner.manager.insert(ImageFile, varmint1ImageFile);
    const varmint1 = queryRunner.manager.create(User, {
      email: "varmint1@moskbt.ru",
      password: "$argon2id$v=19$m=65536,t=3,p=4$AkDifaNYP7MpGXVURtMFKQ$lueOA/EeZJt/AqY3gCmYbN8neZvajT2EV33IYSlTpv8",
      id: "476bcd67-c1c7-4d26-b5d3-a90941f3405f",
      role: UserRoles.TEACHER,
      avatar: varmint1ImageFile,
      avatarId: varmint1ImageFile.id,
      fullName: "Шалун 1",
      teacherInstitution: institution
    });
    let varmint2Image = fs.readFileSync(__dirname + "/../resources/secret-club/secret-moves.gif");
    let varmint2ImageFile = queryRunner.manager.create(ImageFile, {
      data: varmint2Image as unknown as Buffer,
      filename: "varmint2.png"
    });
    await queryRunner.manager.insert(ImageFile, varmint2ImageFile);
    const varmint2 = queryRunner.manager.create(User, {
      email: "varmint2@moskbt.ru",
      password: "$argon2id$v=19$m=65536,t=3,p=4$AkDifaNYP7MpGXVURtMFKQ$lueOA/EeZJt/AqY3gCmYbN8neZvajT2EV33IYSlTpv8",
      id: "0dbab2d7-adc1-4047-aefd-4cc45308cf9f",
      role: UserRoles.TEACHER,
      avatar: varmint2ImageFile,
      avatarId: varmint2ImageFile.id,
      fullName: "Шалун 2",
      teacherInstitution: institution
    });
    let prisonerImage = fs.readFileSync(__dirname + "/../resources/secret-club/caged-woman.png");
    let prisonerImageFile = queryRunner.manager.create(ImageFile, {
      data: prisonerImage as unknown as Buffer,
      filename: "caged-woman.png"
    });
    await queryRunner.manager.insert(ImageFile, prisonerImageFile);
    const prisoner = queryRunner.manager.create(User, {
      email: "prisoner@moskbt.ru",
      password: "$argon2id$v=19$m=65536,t=3,p=4$AkDifaNYP7MpGXVURtMFKQ$lueOA/EeZJt/AqY3gCmYbN8neZvajT2EV33IYSlTpv8",
      id: "2c171122-3d82-43fd-bac7-f19009270d67",
      role: UserRoles.TEACHER,
      avatar: prisonerImageFile,
      avatarId: prisonerImageFile.id,
      fullName: "Пленник",
      teacherInstitution: institution
    });
    await queryRunner.manager.insert(User, [clubleader, security1, security2, slave1, slave2, varmint1, varmint2, prisoner]);

    let lockersImage = fs.readFileSync(__dirname + "/../resources/secret-club/lockers.png");
    let lockersImageFile = queryRunner.manager.create(ImageFile, {
      data: lockersImage as unknown as Buffer,
      filename: "lockers.png"
    });
    await queryRunner.manager.insert(ImageFile, lockersImageFile);
    const lockers = queryRunner.manager.create(Item, {
      institution,
      article: "ШРМ-АК-000",
      image: lockersImageFile,
      imageId: lockersImageFile.id,
      id: "09cb5f60-063c-4374-b0a8-c7487388b31c",
      name: "Запирающиеся шкафчики"
    });
    let cageImage = fs.readFileSync(__dirname + "/../resources/secret-club/cage.jpg");
    let cageImageFile = queryRunner.manager.create(ImageFile, {
      data: cageImage as unknown as Buffer,
      filename: "cage.jpg"
    });
    await queryRunner.manager.insert(ImageFile, cageImageFile);
    const cage = queryRunner.manager.create(Item, {
      institution,
      article: "КЛТК-АК-000",
      image: cageImageFile,
      imageId: cageImageFile.id,
      id: "17c32452-d8fd-4bb0-beb6-a0d19d56432b",
      name: "Клетка"
    });
    let bandageTableImage = fs.readFileSync(__dirname + "/../resources/secret-club/bandage-table.jpg");
    let bandageTableImageFile = queryRunner.manager.create(ImageFile, {
      data: bandageTableImage as unknown as Buffer,
      filename: "cage.png"
    });
    await queryRunner.manager.insert(ImageFile, bandageTableImageFile);
    const bandageTable = queryRunner.manager.create(Item, {
      institution,
      article: "БНДЖ-АК-000",
      image: bandageTableImageFile,
      imageId: bandageTableImageFile.id,
      id: "b49914ec-52af-49b3-bcb4-89fa10101a29",
      name: "Стол для бандажа"
    });
    await queryRunner.manager.insert(Item, [lockers, cage, bandageTable]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const members = await queryRunner.manager.find(User, {
      where: {
        id: In([
          "84736973-c46c-465e-b978-f944ce4bbe9d",
          "9026a126-a3d4-4773-baa1-33d80ebb7758",
          "f6dda00a-879b-4468-a592-fb29da0de555",
          "98ca780c-b5ef-4d09-8886-3612d688fa2e",
          "b78259bd-20b0-4b44-ae95-72a001cbbbf8",
          "476bcd67-c1c7-4d26-b5d3-a90941f3405f",
          "2c171122-3d82-43fd-bac7-f19009270d67",
          "0dbab2d7-adc1-4047-aefd-4cc45308cf9f"
        ])
      }
    });
    await queryRunner.manager.remove(members);
    members.map(async m => {
      try {
        await queryRunner.manager.delete(ImageFile, { id: m.avatarId });
      } catch (error) {
        console.log(error);
      }
    });

    const items = await queryRunner.manager.find(Item, {
      where: {
        id: In(["09cb5f60-063c-4374-b0a8-c7487388b31c", "17c32452-d8fd-4bb0-beb6-a0d19d56432b", "b49914ec-52af-49b3-bcb4-89fa10101a29"])
      }
    });
    await queryRunner.manager.remove(items);
    items.map(async i => {
      try {
        await queryRunner.manager.delete(ImageFile, { id: i.imageId });
      } catch (error) {
        console.log(error);
      }
    });

    const institution = await queryRunner.manager.findOne(Institution, {
      where: { id: "3d04d62f-dc51-4032-8c2c-4d6b44a6bf72" }
    });
    if (institution) {
      await queryRunner.manager.remove(institution);
    }
  }
}
