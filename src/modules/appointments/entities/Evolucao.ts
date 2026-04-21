import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Agendamento } from "./Agendamento";
import { Paciente } from "../../patients/entities/Paciente";

@Entity("evolucoes")
export class Evolucao {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    agendamento_id: number;

    @Column()
    paciente_id: number;

    // --- METODOLOGIA SOAP ---
    @Column("text", { nullable: true })
    subjetivo: string; // "Paciente relata que a dor piorou ao agachar"

    @Column("text", { nullable: true })
    objetivo: string; // "Edema grau 2 em joelho D. ADM de flexão em 90 graus"

    @Column("text", { nullable: true })
    avaliacao: string; // "Melhora parcial do quadro. Boa evolução motora"

    @Column("text", { nullable: true })
    plano: string; // "Feito USG contínuo. Exercícios isométricos. Casa: Gelo 20min"

    // --- AVALIAÇÃO INICIAL / CLINICA ---
    @Column({ nullable: true })
    cid_10: string;

    @Column("text", { nullable: true })
    diagnostico_fisioterapeutico: string;

    @Column("text", { nullable: true })
    objetivos_tratamento: string;
    
    // --- SEGURANÇA E AUDITORIA ---
    @Column({ nullable: true })
    hash_integridade: string;

    @Column({ default: false })
    finalizada: boolean;

    @Column({ nullable: true })
    data_finalizacao: Date;
    
    @CreateDateColumn()
    data_criacao: Date;

    @ManyToOne(() => Agendamento)
    @JoinColumn({ name: "agendamento_id" })
    agendamento: Agendamento;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente_id" })
    paciente: Paciente;
}