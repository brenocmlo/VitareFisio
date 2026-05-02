import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserSubscriptionsAndWebhookEvents1777100000000
  implements MigrationInterface
{
  name = "CreateUserSubscriptionsAndWebhookEvents1777100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "webhook_events" (
        "id" SERIAL NOT NULL,
        "event_id" character varying NOT NULL,
        "event_name" character varying,
        "status" character varying NOT NULL DEFAULT 'received',
        "payload" jsonb,
        "error" text,
        "processed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhook_events_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_webhook_events_event_id" UNIQUE ("event_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_subscriptions" (
        "id" SERIAL NOT NULL,
        "usuario_id" integer NOT NULL,
        "abacate_customer_id" character varying,
        "abacate_subscription_id" character varying,
        "last_checkout_id" character varying,
        "last_payment_id" character varying,
        "plan_cycle" character varying,
        "status" character varying,
        "current_period_end" TIMESTAMP,
        "last_event_id" character varying,
        "last_event_name" character varying,
        "last_event_at" TIMESTAMP,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_subscriptions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_subscriptions_usuario_id" UNIQUE ("usuario_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_subscriptions"`);
    await queryRunner.query(`DROP TABLE "webhook_events"`);
  }
}

