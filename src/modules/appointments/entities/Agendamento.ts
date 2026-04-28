import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { Paciente } from "../../patients/entities/Paciente";
import { PacotePaciente } from "../../patients/entities/PacotePaciente";

@Entity("agendamentos")
export class Agendamento {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({
        name: "data_hora_inicio",
        type: "timestamptz",
    })
    data_hora: Date;

    @Column({
        type: "timestamptz",
    })
    data_hora_fim: Date;
    
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

    @Index()
    @Column()
    clinica_id: number;

    @Index()
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