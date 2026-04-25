import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTokens1777085925160 implements MigrationInterface {
    name = 'CreateUserTokens1777085925160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_tokens" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_63764db9d9aaa4af33e07b2f4bf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "clinicas" ALTER COLUMN "data_criacao" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clinicas" ALTER COLUMN "data_criacao" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "user_tokens"`);
    }

}
