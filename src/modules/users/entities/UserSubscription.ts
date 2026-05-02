import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("user_subscriptions")
export class UserSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  usuario_id: number;

  @Column({ nullable: true })
  abacate_customer_id: string;

  @Column({ nullable: true })
  abacate_subscription_id: string;

  @Column({ nullable: true })
  last_checkout_id: string;

  @Column({ nullable: true })
  last_payment_id: string;

  @Column({ nullable: true })
  plan_cycle: string;

  @Column({ nullable: true })
  status: string;

  @Column({ type: "timestamp", nullable: true })
  current_period_end: Date;

  @Column({ nullable: true })
  last_event_id: string;

  @Column({ nullable: true })
  last_event_name: string;

  @Column({ type: "timestamp", nullable: true })
  last_event_at: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

