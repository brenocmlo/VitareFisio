import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { hash } from "bcryptjs";

@Entity("usuarios")
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;
    @Column({ unique: true })
    cpf: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false }) // A senha não virá em buscas comuns por segurança
    senha: string;

    @Column()
    clinica_id: number;

    @Column({ type: "enum", enum: ["admin", "fisioterapeuta", "recepcao"] })
    tipo: string;

    @CreateDateColumn()
    data_criacao: Date;
}