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

    @Column("text")
    descricao: string;

    @Column("text", { nullable: true })
    procedimentos: string;
    
    @Column({ nullable: true })
    cid_10: string;

    @Column("text", { nullable: true })
    diagnostico_fisioterapeutico: string;

    @Column("text", { nullable: true })
    objetivos_tratamento: string;
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