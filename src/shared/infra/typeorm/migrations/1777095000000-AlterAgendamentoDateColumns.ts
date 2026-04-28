import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAgendamentoDateColumns1777095000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agendamentos" ALTER COLUMN "data_hora_inicio" TYPE timestamp with time zone USING "data_hora_inicio" AT TIME ZONE 'America/Sao_Paulo'`);
        await queryRunner.query(`ALTER TABLE "agendamentos" ALTER COLUMN "data_hora_fim" TYPE timestamp with time zone USING "data_hora_fim" AT TIME ZONE 'America/Sao_Paulo'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agendamentos" ALTER COLUMN "data_hora_inicio" TYPE timestamp without time zone`);
        await queryRunner.query(`ALTER TABLE "agendamentos" ALTER COLUMN "data_hora_fim" TYPE timestamp without time zone`);
    }
}
