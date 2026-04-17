import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../../appointments/entities/Agendamento";
import { Pagamento } from "../../finance/entities/Pagamento";
import { Between } from "typeorm";

export class GetDashboardSummaryService {
    async execute(clinica_id: number) {
        const agendamentoRepository = AppDataSource.getRepository(Agendamento);
        const pagamentoRepository = AppDataSource.getRepository(Pagamento);

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);

        // 1. Agendamentos de Hoje
        const atendimentosHoje = await agendamentoRepository.count({
            where: {
                paciente: { clinica_id },
                data_hora: Between(hoje, amanha)
            }
        });

        // 2. Faturamento do Dia
        const pagamentosHoje = await pagamentoRepository.find({
            where: {
                status: "pago",
                paciente: { clinica_id },
                data_pagamento: Between(hoje, amanha)
            }
        });
        const totalFaturado = pagamentosHoje.reduce((acc, pag) => acc + Number(pag.valor), 0);

        return {
            atendimentos_hoje: atendimentosHoje,
            faturamento_dia: totalFaturado,
            data: hoje.toLocaleDateString('pt-BR')
        };
    }
}