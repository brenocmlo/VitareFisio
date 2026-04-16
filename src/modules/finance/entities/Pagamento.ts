import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "../../patients/entities/Paciente";
import { Agendamento } from "../../appointments/entities/Agendamento";

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

    @Column({ type: "enum", enum: ['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'convenio'] })
    forma_pagamento: string;

    @Column({ type: "enum", enum: ['pendente', 'pago', 'cancelado'], default: 'pago' })
    status: string;

    @CreateDateColumn()
    data_pagamento: Date;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente_id" })
    paciente: Paciente;

    @ManyToOne(() => Agendamento)
    @JoinColumn({ name: "agendamento_id" })
    agendamento: Agendamento;
}