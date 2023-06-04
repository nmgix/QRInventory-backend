import { MigrationInterface, QueryRunner } from "typeorm";

export class PasswordResetTickets1685846032972 implements MigrationInterface {
    name = 'PasswordResetTickets1685846032972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "password_request_ticket" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "created_date" TIMESTAMP NOT NULL DEFAULT now(), "institutionId" uuid, CONSTRAINT "PK_2b73ccd4497551bb0d01023d826" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "password_request_ticket" ADD CONSTRAINT "FK_91acd027b6eb17f37c8c6db019a" FOREIGN KEY ("institutionId") REFERENCES "institution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_request_ticket" DROP CONSTRAINT "FK_91acd027b6eb17f37c8c6db019a"`);
        await queryRunner.query(`DROP TABLE "password_request_ticket"`);
    }

}
