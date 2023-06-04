import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedUser1685900213669 implements MigrationInterface {
    name = 'UpdatedUser1685900213669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "nextAvailableRequestDate" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "nextAvailableRequestDate"`);
    }

}
