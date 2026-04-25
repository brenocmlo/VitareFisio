import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsAutonomoField1777084037735 implements MigrationInterface {
    name = 'AddIsAutonomoField1777084037735'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "is_autonomo" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "fisioterapeutas" ADD "is_autonomo" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "google_refresh_token"`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "google_refresh_token" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "google_refresh_token"`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "google_refresh_token" text`);
        await queryRunner.query(`ALTER TABLE "fisioterapeutas" DROP COLUMN "is_autonomo"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "is_autonomo"`);
    }

}
