import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("pacientes") // Define o nome exato da tabela no MySQL
export class Paciente {
    @PrimaryGeneratedColumn()
    id: number;

    // Por enquanto será uma coluna normal, depois faremos o relacionamento @ManyToOne com a entidade Clinica
    @Column()
    clinica_id: number; 

    @Column({ length: 100 })
    nome: string;

    @Column({ length: 14, unique: true })
    cpf: string;

    @Column({ type: "date", nullable: true })
    data_nascimento: Date;

    @Column({ length: 20, nullable: true })
    contato_whatsapp: string;

    @Column({ type: "text", nullable: true })
    endereco_completo: string;

    @Column({ length: 50, default: "Particular" })
    convenio_nome: string;

    @Column({ 
        type: "enum", 
        enum: ["em_dia", "pendente", "inadimplente"], 
        default: "em_dia" 
    })
    situacao_financeira: string;

    @Column({ 
        type: "enum", 
        enum: ["ativo", "inativo"], 
        default: "ativo" 
    })
    status: string;

    @CreateDateColumn()
    data_cadastro: Date;
}