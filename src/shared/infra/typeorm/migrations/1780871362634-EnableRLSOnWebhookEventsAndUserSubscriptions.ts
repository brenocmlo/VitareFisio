import { MigrationInterface, QueryRunner } from "typeorm";

export class EnableRLSOnWebhookEventsAndUserSubscriptions1780871362634 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook_events" ENABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE "user_subscriptions" ENABLE ROW LEVEL SECURITY;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_subscriptions" DISABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE "webhook_events" DISABLE ROW LEVEL SECURITY;`);
    }

}

