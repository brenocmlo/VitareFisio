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

    @Column()
    clinica_id: number;

    @Column("decimal", { precision: 10, scale: 2 })
    valor: number;

    @Column()
    metodo_pagamento: "dinheiro" | "cartao" | "pix" | "convenio";

    @Column({ default: "pendente" })
    status: "pago" | "pendente" | "atrasado";

    @Column({ type: "date", nullable: true })
    data_vencimento: Date;

    @Column({ type: "date", nullable: true })
    data_pagamento: Date;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente_id" })
    paciente: Paciente;

    @ManyToOne(() => Agendamento)
    @JoinColumn({ name: "agendamento_id" })
    agendamento: Agendamento;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;
}