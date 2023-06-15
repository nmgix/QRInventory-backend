// import { Cabinet } from "../modules/cabinet/cabinet.entity";
// import { In, MigrationInterface, QueryRunner } from "typeorm";
// import { Institution } from "../modules/institution/institution.entity";
// import { User } from "../modules/user/user.entity";
// import { Item } from "../modules/item/item.entity";

// export class ClubCabinetsInit1686243088871 implements MigrationInterface {
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     const institution = await queryRunner.manager.findOne(Institution, {
//       where: { id: "3d04d62f-dc51-4032-8c2c-4d6b44a6bf72" }
//     });

//     const clubleader = await queryRunner.manager.findOne(User, {
//       where: { id: "84736973-c46c-465e-b978-f944ce4bbe9d" }
//     });
//     const security1 = await queryRunner.manager.findOne(User, {
//       where: { id: "9026a126-a3d4-4773-baa1-33d80ebb7758" }
//     });
//     const security2 = await queryRunner.manager.findOne(User, {
//       where: { id: "f6dda00a-879b-4468-a592-fb29da0de555" }
//     });
//     const slave1 = await queryRunner.manager.findOne(User, {
//       where: { id: "98ca780c-b5ef-4d09-8886-3612d688fa2e" }
//     });
//     const slave2 = await queryRunner.manager.findOne(User, {
//       where: { id: "b78259bd-20b0-4b44-ae95-72a001cbbbf8" }
//     });
//     const varmint = await queryRunner.manager.findOne(User, {
//       where: { id: "476bcd67-c1c7-4d26-b5d3-a90941f3405f" }
//     });
//     const prisoner = await queryRunner.manager.findOne(User, {
//       where: { id: "2c171122-3d82-43fd-bac7-f19009270d67" }
//     });

//     const lockers = await queryRunner.manager.findOne(Item, {
//       where: { id: "09cb5f60-063c-4374-b0a8-c7487388b31c" }
//     });
//     const cage = await queryRunner.manager.findOne(Item, {
//       where: { id: "17c32452-d8fd-4bb0-beb6-a0d19d56432b" }
//     });
//     const bandageTable = await queryRunner.manager.findOne(Item, {
//       where: { id: "b49914ec-52af-49b3-bcb4-89fa10101a29" }
//     });

//     const lockerRoom = queryRunner.manager.create(Cabinet, {
//       cabinetNumber: "♂ Раздевалка ♂",
//       id: "7df51b1a-640b-4eb8-87ce-4ca9d4eb0d1c",
//       institution,
//       teachers: [clubleader, security1, security2, slave1, slave2, varmint, prisoner],
//       items: [lockers, cage, bandageTable]
//     });
//     const prisonersRoom = queryRunner.manager.create(Cabinet, {
//       cabinetNumber: "Концлагерь",
//       id: "8e7524b5-e9c0-4a2d-a584-8b7321a75f03",
//       institution,
//       teachers: [security1, slave1, slave2, varmint, prisoner],
//       items: [lockers, cage]
//     });
//     await queryRunner.manager.save(Cabinet, [lockerRoom, prisonersRoom]);
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     const cabinets = await queryRunner.manager.find(Cabinet, {
//       where: {
//         id: In(["7df51b1a-640b-4eb8-87ce-4ca9d4eb0d1c", "8e7524b5-e9c0-4a2d-a584-8b7321a75f03"])
//       }
//     });
//     await queryRunner.manager.remove(cabinets);
//   }
// }
