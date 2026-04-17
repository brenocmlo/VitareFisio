import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("pagamentos")
export class Pagamento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    paciente_id: number;

    @Column()
    clinica_id: number; // <-- VITAL para o Workspace (Autônomos e Clínicas isolados)

    @Column({ nullable: true })
    agendamento_id: number; // Pode ser nulo se for venda de um "Pacote" fechado e não de 1 sessão

    @Column("decimal", { precision: 10, scale: 2 })
    valor: number;

    @Column({ type: "enum", enum: ["pix", "cartao_credito", "cartao_debito", "dinheiro", "convenio"] })
    forma_pagamento: string;

    @Column({ type: "enum", enum: ["pendente", "pago", "cancelado", "estornado"], default: "pendente" })
    status: string;

    @Column()
    data_pagamento: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}