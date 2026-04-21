import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Paciente } from "../../patients/entities/Paciente";
import { Agendamento } from "../../appointments/entities/Agendamento";
import { Clinica } from "../../clinics/entities/Clinica"; // Importe a entidade Clinica se houver

@Entity("pagamentos")
export class Pagamento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    paciente_id: number;

    @Column({ nullable: true })
    agendamento_id: number;

    // Adicionando clinica_id para o dashboard financeiro filtrar por unidade
    @Column()
    clinica_id: number;

    @Column("decimal", { precision: 10, scale: 2 })
    valor: number;

    @Column()
    metodo_pagamento: "dinheiro" | "cartao" | "pix" | "convenio";

    @Column({ default: "pendente" })
    status: "pago" | "pendente" | "atrasado";

    // AJUSTE AQUI: nullable: true resolve o erro 1292 do MySQL
    @Column({ type: "date", nullable: true })
    data_vencimento: Date;

    @Column({ type: "date", nullable: true })
    data_pagamento: Date;

    @ManyToOne(() => Paciente)
    @JoinColumn({ name: "paciente_id" })
    paciente: Paciente;

    @ManyToOne(() => Agendamento)
    @JoinColumn({ name: "agendamento_id" })
    agendamento: Agendamento;

    @CreateDateColumn()
    created_at: Date;
}