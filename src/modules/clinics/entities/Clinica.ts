import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("clinicas")
export class Clinica {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome_fantasia: string;

    @Column({ nullable: true })
    razao_social: string;

    @Column({ unique: true, nullable: true })
    cnpj: string;

    @Column({ nullable: true })
    telefone: string;

    @Column("text", { nullable: true })
    endereco: string;

    @CreateDateColumn()
    data_criacao: Date;
}