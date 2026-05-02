import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("webhook_events")
export class WebhookEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  event_id: string;

  @Column({ nullable: true })
  event_name: string;

  @Column({ default: "received" })
  status: string;

  @Column({ type: "jsonb", nullable: true })
  payload: Record<string, unknown>;

  @Column({ type: "text", nullable: true })
  error: string;

  @Column({ type: "timestamp", nullable: true })
  processed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

