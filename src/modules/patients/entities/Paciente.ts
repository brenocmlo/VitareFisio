import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity("pacientes")
export class Paciente {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    clinica_id: number;

    @Index()
    @Column({ nullable: true })
    usuario_id: number; // Dono do paciente (RLS)

    @Index()
    @Column()
    nome: string;

    @Column({ unique: true })
    cpf: string;

    @Column({ type: "date", nullable: true }) // No Postgres usamos 'date' para aniversários
    data_nascimento: Date;

    @Column({ nullable: true })
    contato_whatsapp: string;

    @Column("text", { nullable: true })
    endereco_completo: string;

    @Column("decimal", { precision: 10, scale: 2, nullable: true })
    valor_sessao: number;

    @CreateDateColumn({ type: "timestamp" })
    data_criacao: Date;
}