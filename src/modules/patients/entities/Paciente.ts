import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Clinica } from "../../clinics/entities/Clinica"; // Certifique-se de que o caminho está correto

@Entity("pacientes")
export class Paciente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    clinica_id: number;

    @Column()
    nome: string;

    @Column({ unique: true })
    cpf: string;

    @Column()
    data_nascimento: Date;

    // AQUI O SEGREDO: Mude de 'telefone' para 'contato_whatsapp'
    @Column()
    contato_whatsapp: string;

    // AQUI TAMBÉM: Mude de 'endereco' para 'endereco_completo'
    @Column("text", { nullable: true })
    endereco_completo: string;

    @Column("decimal", { precision: 10, scale: 2 })
    valor_sessao: number;

    @CreateDateColumn()
    data_criacao: Date;
}