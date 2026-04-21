import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    JoinColumn 
} from "typeorm";

import { Paciente } from "../../patients/entities/Paciente";
// 1. Importamos a entidade de Pacote
import { PacotePaciente } from "../../patients/entities/PacotePaciente";

@Entity("agendamentos")
export class Agendamento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "data_hora_inicio", type: "datetime" })
    data_hora: Date;

    @Column()
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

    @Column()
    clinica_id: number;

    @Column()
    fisioterapeuta_id: number;

    // 2. NOVA COLUNA: Resolve o erro "Unknown column 'pacote_paciente_id'"
    @Column({ nullable: true })
    pacote_paciente_id: number;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente_id" })
    paciente: Paciente;

    // 3. NOVO RELACIONAMENTO: Conecta o agendamento ao pacote
    @ManyToOne(() => PacotePaciente, { nullable: true })
    @JoinColumn({ name: "pacote_paciente_id" })
    pacote: PacotePaciente;
}