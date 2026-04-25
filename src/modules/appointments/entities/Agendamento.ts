import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "../../patients/entities/Paciente";
import { PacotePaciente } from "../../patients/entities/PacotePaciente";
import { appointmentDateTimeTransformer } from "../utils/appointmentDateTime";

@Entity("agendamentos")
export class Agendamento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: "data_hora_inicio",
        type: "timestamp", // Ajustado para Postgres
        transformer: appointmentDateTimeTransformer,
    })
    data_hora: string;

    @Column({
        type: "timestamp", // Ajustado para Postgres
        transformer: appointmentDateTimeTransformer,
    })
    data_hora_fim: string;
    
    @Column({ 
        type: "enum", 
        enum: ["agendado", "confirmado", "realizado", "faltou", "cancelado"], 
        default: "agendado" 
    })
    status: string;

    @Column({ type: "text", nullable: true })
    observacoes?: string;

    @Column()
    paciente_id: number;

    @Column()
    clinica_id: number;

    @Column()
    fisioterapeuta_id: number;

    @Column({ nullable: true })
    pacote_paciente_id: number;

    @Column({ nullable: true })
    google_event_id: string;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente_id" })
    paciente: Paciente;

    @ManyToOne(() => PacotePaciente, { nullable: true })
    @JoinColumn({ name: "pacote_paciente_id" })
    pacote: PacotePaciente;
}