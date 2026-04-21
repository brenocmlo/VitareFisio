import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Pagamento } from "../../finance/entities/Pagamento"; 
import { PacotePaciente } from "../../patients/entities/PacotePaciente";

export class UpdateAgendamentoStatusService {
    async execute({ agendamento_id, status }: { agendamento_id: number, status: string }) {
        const agendamentoRepo = AppDataSource.getRepository(Agendamento);
        const pagamentoRepo = AppDataSource.getRepository(Pagamento);
        const pacoteRepo = AppDataSource.getRepository(PacotePaciente);

        const agendamento = await agendamentoRepo.findOne({
            where: { id: agendamento_id },
            relations: ["paciente"]
        });

        if (!agendamento) throw new Error("Agendamento não encontrado.");
        agendamento.status = status;
        await agendamentoRepo.save(agendamento);

        if (status === "realizado") {
            const jaFaturado = await pagamentoRepo.findOneBy({ agendamento_id });
            if (jaFaturado) return agendamento;

            // Busca pacote com sessões (CRÉDITO)
            const pacote = await pacoteRepo.findOne({
                where: { paciente_id: agendamento.paciente_id, status_pagamento: 'pago' },
                order: { data_compra: 'ASC' }
            });

            if (pacote && pacote.sessoes_restantes > 0) {
                // DÉBITO DO PACOTE
                pacote.sessoes_restantes -= 1;
                await pacoteRepo.save(pacote);
            } else {
                // DÉBITO FINANCEIRO (COBRANÇA AVULSA)
                const pagamento = pagamentoRepo.create({
                    paciente_id: agendamento.paciente_id,
                    agendamento_id: agendamento.id,
                    clinica_id: agendamento.clinica_id,
                    valor: 150.00,
                    metodo_pagamento: "pix",
                    status: "pendente",
                    data_vencimento: new Date()
                });
                await pagamentoRepo.save(pagamento);
            }
        }
        return agendamento;
    }
}