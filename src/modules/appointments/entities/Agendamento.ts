import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    ManyToOne, 
    JoinColumn 
} from "typeorm";

// Importamos a entidade de Paciente para criar o relacionamento
import { Paciente } from "../../patients/entities/Paciente";

@Entity("agendamentos")
export class Agendamento {
    @PrimaryGeneratedColumn()
    id: number;

    // A data e hora exata da sessão de fisioterapia
    @Column({ type: "datetime" })
    data_hora: Date;

    // Máquina de Estados: Controla a jornada do paciente naquele dia
    @Column({ 
        type: "enum", 
        enum: ["agendado", "confirmado", "realizado", "faltou", "cancelado"], 
        default: "agendado" 
    })
    status: string;

    @Column({ type: "text", nullable: true })
    observacoes: string;

    // --- RELACIONAMENTO COM O PACIENTE ---
    
    // 1. A coluna que vai guardar o ID no banco de dados
    @Column()
    paciente_id: number;

    // 2. A "Mágica" do TypeORM: Ensina que Muitos (Many) Agendamentos pertencem a Um (One) Paciente
    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente_id" })
    paciente: Paciente;

    // -------------------------------------

    @CreateDateColumn()
    data_criacao: Date;
}