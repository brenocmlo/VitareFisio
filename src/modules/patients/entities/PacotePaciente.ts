import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "./Paciente"; // Ajuste o caminho se necessário

@Entity("pacotes_pacientes")
export class PacotePaciente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    paciente_id: number;

    @Column()
    modelo_id: number; // Pode referenciar uma tabela 'modelos_pacotes' no futuro

    @CreateDateColumn()
    data_compra: Date;

    @Column("int")
    sessoes_restantes: number;

    @Column({ type: "date" })
    data_validade: Date;

    @Column({ 
        type: "enum", 
        enum: ['pendente', 'pago', 'cancelado'], 
        default: 'pendente' 
    })
    status_pagamento: string;

    // Relacionamento (Opcional, mas muito útil)
    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente_id" })
    paciente: Paciente;
}