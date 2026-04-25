import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddGoogleEventIdToAgendamentos1777089000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "agendamentos",
            new TableColumn({
                name: "google_event_id",
                type: "varchar",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("agendamentos", "google_event_id");
    }

}
