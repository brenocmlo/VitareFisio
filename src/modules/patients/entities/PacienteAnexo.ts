import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "./Paciente";

@Entity("paciente_anexos")
export class PacienteAnexo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    paciente_id: number;

    // Multitenancy — nullable para compatibilidade com registos existentes
    @Column({ nullable: true })
    clinica_id: number;

    @Column()
    titulo: string;

    @Column()
    nome_arquivo: string;

    // Categoria do anexo: exame, laudo, receita, atestado, outro
    @Column({ nullable: true })
    tipo: string;

    // MIME type do ficheiro (ex: "application/pdf", "image/png")
    @Column({ nullable: true })
    tipo_mime: string;

    // Tamanho em bytes para exibir no frontend
    @Column({ type: "bigint", nullable: true })
    tamanho_bytes: number;

    @CreateDateColumn()
    data_criacao: Date;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente_id" })
    paciente: Paciente;
}
