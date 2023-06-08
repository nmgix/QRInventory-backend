import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1685609109526 implements MigrationInterface {
  name = "Init1685609109526";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "image_file" ("id" SERIAL NOT NULL, "filename" character varying NOT NULL, "data" bytea NOT NULL, CONSTRAINT "PK_a63c149156c13fef954c6f56398" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "article" character varying NOT NULL, "name" character varying NOT NULL, "imageId" integer, "institutionId" uuid, CONSTRAINT "UQ_eb15c391b4b9905e8143f5292ab" UNIQUE ("article"), CONSTRAINT "REL_4e9b8917d85122b13f11939d7d" UNIQUE ("imageId"), CONSTRAINT "PK_d3c0c71f23e7adcf952a1d13423" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'teacher')`);
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nextAvailableRequestDate" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "fullName" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'teacher', "password" character varying NOT NULL, "refreshToken" character varying, "avatarId" integer, "teacherInstitutionId" uuid, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "REL_58f5c71eaab331645112cf8cfa" UNIQUE ("avatarId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "cabinet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cabinetNumber" character varying NOT NULL, "institutionId" uuid, CONSTRAINT "PK_6e1aaa59022d432d8cf3df7ef46" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "institution" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "adminId" uuid, CONSTRAINT "UQ_d218ad3566afa9e396f184fd7d5" UNIQUE ("name"), CONSTRAINT "PK_f60ee4ff0719b7df54830b39087" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "cabinet_teachers_user" ("cabinetId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_830ff02f4a2f48e9e173e011dc9" PRIMARY KEY ("cabinetId", "userId"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_a1182c83652c82053314fb6208" ON "cabinet_teachers_user" ("cabinetId") `);
    await queryRunner.query(`CREATE INDEX "IDX_df382d4bb9b3282238e1533584" ON "cabinet_teachers_user" ("userId") `);
    await queryRunner.query(
      `CREATE TABLE "cabinet_items_item" ("cabinetId" uuid NOT NULL, "itemId" uuid NOT NULL, CONSTRAINT "PK_20faf2ec2114cda30c20a449aa9" PRIMARY KEY ("cabinetId", "itemId"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_d30c846fbcf96e26a01d618d61" ON "cabinet_items_item" ("cabinetId") `);
    await queryRunner.query(`CREATE INDEX "IDX_fe415677d3fea0256adcb178e8" ON "cabinet_items_item" ("itemId") `);
    await queryRunner.query(
      `ALTER TABLE "item" ADD CONSTRAINT "FK_ded57e4ceef276c1f93783838a7" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "item" ADD CONSTRAINT "FK_4e9b8917d85122b13f11939d7d8" FOREIGN KEY ("imageId") REFERENCES "image_file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_716e796561e27454d0524dfbb1f" FOREIGN KEY ("teacherInstitutionId") REFERENCES "institution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_58f5c71eaab331645112cf8cfa5" FOREIGN KEY ("avatarId") REFERENCES "image_file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "cabinet" ADD CONSTRAINT "FK_af6fd1a721927f02acce878b5f6" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "institution" ADD CONSTRAINT "FK_c818a4fb122f2e1cfe887bcada1" FOREIGN KEY ("adminId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "cabinet_teachers_user" ADD CONSTRAINT "FK_a1182c83652c82053314fb62089" FOREIGN KEY ("cabinetId") REFERENCES "cabinet"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "cabinet_teachers_user" ADD CONSTRAINT "FK_df382d4bb9b3282238e15335849" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "cabinet_items_item" ADD CONSTRAINT "FK_d30c846fbcf96e26a01d618d618" FOREIGN KEY ("cabinetId") REFERENCES "cabinet"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "cabinet_items_item" ADD CONSTRAINT "FK_fe415677d3fea0256adcb178e83" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cabinet_items_item" DROP CONSTRAINT "FK_fe415677d3fea0256adcb178e83"`);
    await queryRunner.query(`ALTER TABLE "cabinet_items_item" DROP CONSTRAINT "FK_d30c846fbcf96e26a01d618d618"`);
    await queryRunner.query(`ALTER TABLE "cabinet_teachers_user" DROP CONSTRAINT "FK_df382d4bb9b3282238e15335849"`);
    await queryRunner.query(`ALTER TABLE "cabinet_teachers_user" DROP CONSTRAINT "FK_a1182c83652c82053314fb62089"`);
    await queryRunner.query(`ALTER TABLE "institution" DROP CONSTRAINT "FK_c818a4fb122f2e1cfe887bcada1"`);
    await queryRunner.query(`ALTER TABLE "cabinet" DROP CONSTRAINT "FK_af6fd1a721927f02acce878b5f6"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_58f5c71eaab331645112cf8cfa5"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_716e796561e27454d0524dfbb1f"`);
    await queryRunner.query(`ALTER TABLE "item" DROP CONSTRAINT "FK_4e9b8917d85122b13f11939d7d8"`);
    await queryRunner.query(`ALTER TABLE "item" DROP CONSTRAINT "FK_ded57e4ceef276c1f93783838a7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fe415677d3fea0256adcb178e8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d30c846fbcf96e26a01d618d61"`);
    await queryRunner.query(`DROP TABLE "cabinet_items_item"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_df382d4bb9b3282238e1533584"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a1182c83652c82053314fb6208"`);
    await queryRunner.query(`DROP TABLE "cabinet_teachers_user"`);
    await queryRunner.query(`DROP TABLE "institution"`);
    await queryRunner.query(`DROP TABLE "cabinet"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    await queryRunner.query(`DROP TABLE "item"`);
    await queryRunner.query(`DROP TABLE "image_file"`);
  }
}
