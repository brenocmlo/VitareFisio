import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "./Paciente";

@Entity("paciente_anexos")
export class PacienteAnexo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    paciente_id: number;

    @Column()
    titulo: string;

    @Column()
    nome_arquivo: string;

    @CreateDateColumn()
    data_criacao: Date;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente_id" })
    paciente: Paciente;
}