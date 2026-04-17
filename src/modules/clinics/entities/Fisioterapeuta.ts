import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Clinica } from "../../clinics/entities/Clinica";

@Entity("fisioterapeutas")
export class Fisioterapeuta {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    clinica_id: number;

    @Column()
    nome: string;

    @Column({ unique: true })
    crefito: string;

    @Column({ nullable: true })
    especialidade: string;

    @Column({ nullable: true })
    email: string;

    @Column({ type: "enum", enum: ["ativo", "inativo"], default: "ativo" })
    status: string;

    @ManyToOne(() => Clinica)
    @JoinColumn({ name: "clinica_id" })
    clinica: Clinica;
}