import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "../../patients/entities/Paciente";

@Entity("pagamentos")
export class Pagamento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    paciente_id: number;

    @Column({ nullable: true })
    agendamento_id: number;

    @Column("decimal", { precision: 10, scale: 2 })
    valor: number;

    @Column({ type: "enum", enum: ["pendente", "pago", "cancelado"], default: "pendente" })
    status: string;

    @Column({ type: "enum", enum: ["dinheiro", "cartao", "pix", "convenio"], nullable: true })
    forma_pagamento: string;

    @Column()
    data_vencimento: Date;

    @Column({ nullable: true })
    data_pagamento: Date;

    @CreateDateColumn()
    data_criacao: Date;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente_id" })
    paciente: Paciente;
}