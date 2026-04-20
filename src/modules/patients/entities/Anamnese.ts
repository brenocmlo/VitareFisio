import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "./Paciente";

@Entity("anamneses")
export class Anamnese {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    paciente_id: number;

    @Column("text", { nullable: true })
    queixa_principal: string;

    @Column("text", { nullable: true })
    historico_doenca_atual: string;

    @Column("text", { nullable: true })
    historico_patologico_pregresso: string;

    @Column("text", { nullable: true })
    medicamentos_em_uso: string;

    @Column("text", { nullable: true })
    exames_complementares: string;

    @Column("text", { nullable: true })
    observacoes: string;

    @CreateDateColumn()
    data_criacao: Date;

    @UpdateDateColumn()
    data_atualizacao: Date;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente_id" })
    paciente: Paciente;
}
