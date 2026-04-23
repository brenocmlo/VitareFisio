import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "./Paciente";

@Entity("pacotes_pacientes")
export class PacotePaciente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    paciente_id: number;

    @Column()
    clinica_id: number;

    @Column("integer") // Ajustado para Postgres
    sessoes_total: number;

    @Column("integer") // Ajustado para Postgres
    sessoes_restantes: number;

    @Column({ type: "date", nullable: true })
    data_validade: Date;

    @Column({
        type: "enum",
        enum: ["pendente", "pago", "cancelado"],
        default: "pendente"
    })
    status_pagamento: string;

    @CreateDateColumn({ type: "timestamp" })
    data_compra: Date;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente_id" })
    paciente: Paciente;
}