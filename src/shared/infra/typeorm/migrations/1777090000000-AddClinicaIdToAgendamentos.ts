import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddClinicaIdToTables1777090000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const tables = ["agendamentos", "pacotes_pacientes", "pagamentos", "pacientes"];

        for (const tableName of tables) {
            const hasColumn = await queryRunner.hasColumn(tableName, "clinica_id");
            if (!hasColumn) {
                await queryRunner.addColumn(
                    tableName,
                    new TableColumn({
                        name: "clinica_id",
                        type: "integer",
                        isNullable: true,
                    })
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tables = ["agendamentos", "pacotes_pacientes", "pagamentos", "pacientes"];
        for (const tableName of tables) {
            await queryRunner.dropColumn(tableName, "clinica_id");
        }
    }
}
