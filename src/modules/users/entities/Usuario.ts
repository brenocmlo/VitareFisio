import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

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

    @Column({ select: false })
    senha: string;

    @Column()
    clinica_id: number;

    @Column({ type: "enum", enum: ["admin", "fisioterapeuta", "recepcao"] })
    tipo: string;

    @CreateDateColumn({ type: "timestamp" })
    data_criacao: Date;
}