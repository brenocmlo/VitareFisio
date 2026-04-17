import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Clinica } from "../../clinics/entities/Clinica"; // Certifique-se de que o caminho está correto

@Entity("pacientes")
export class Paciente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    clinica_id: number; // <-- ADICIONADO

    @Column()
    nome: string;

    @Column({ unique: true })
    cpf: string;

    @Column()
    data_nascimento: Date;

    @Column()
    telefone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    valor_sessao: number;

    @CreateDateColumn()
    data_criacao: Date;

    // Relacionamento com a Clínica
    @ManyToOne(() => Clinica)
    @JoinColumn({ name: "clinica_id" })
    clinica: Clinica;
}