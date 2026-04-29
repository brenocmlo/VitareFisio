import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../../appointments/entities/Agendamento";
import { Paciente } from "../../patients/entities/Paciente";
import { Pagamento } from "../../finance/entities/Pagamento"; // <-- Importe o Pagamento
import { Between, In } from "typeorm";
import {
    getAppointmentDayBounds,
    getAppointmentMonthBounds,
    getCurrentAppointmentDateTime,
} from "../../appointments/utils/appointmentDateTime";

export class GetDashboardMetricsService {
    async execute(clinica_id: number) {
        const pacienteRepo = AppDataSource.getRepository(Paciente);
        const agendamentoRepo = AppDataSource.getRepository(Agendamento);
        const pagamentoRepo = AppDataSource.getRepository(Pagamento); // <-- Novo repositório

        // --- 1. DATAS DE REFERÊNCIA ---
        const agoraLocal = getCurrentAppointmentDateTime();
        const hojeLocal = agoraLocal.slice(0, 10);
        const anoAtual = Number(hojeLocal.slice(0, 4));
        const mesAtualIndex = Number(hojeLocal.slice(5, 7)) - 1;
        const [inicioDoDia, fimDoDia] = getAppointmentDayBounds(hojeLocal);
        const [primeiroDiaDoMes, ultimoDiaDoMes] = getAppointmentMonthBounds(
            hojeLocal.slice(5, 7),
            hojeLocal.slice(0, 4)
        );
        const primeiroDiaPagamentoMes = new Date(anoAtual, mesAtualIndex, 1);
        const ultimoDiaPagamentoMes = new Date(anoAtual, mesAtualIndex + 1, 0, 23, 59, 59, 999);

        // --- 2. MÉTRICAS GERAIS ---
        const totalPacientes = await pacienteRepo.count();

        // --- 3. MÉTRICAS DO DIA ---
        const agendamentosHoje = await agendamentoRepo.count({
            where: { clinica_id, data_hora: Between(new Date(inicioDoDia), new Date(fimDoDia)), status: In(["agendado", "confirmado"]) as any }
        });

        const proximosAtendimentos = await agendamentoRepo.find({
            where: { clinica_id, data_hora: Between(new Date(agoraLocal), new Date(fimDoDia)), status: In(["agendado", "confirmado"]) as any },
            order: { data_hora: "ASC" },
            take: 5
        });

        // --- 4. MÉTRICAS MENSAIS (SESSÕES E FALTAS) ---
        const sessoesRealizadasMes = await agendamentoRepo.count({
            where: { clinica_id, data_hora: Between(new Date(primeiroDiaDoMes), new Date(ultimoDiaDoMes)), status: "realizado" as any }
        });

        const faltasCancelamentosMes = await agendamentoRepo.count({
            where: { clinica_id, data_hora: Between(new Date(primeiroDiaDoMes), new Date(ultimoDiaDoMes)), status: In(["faltou", "cancelado"]) as any }
        });

        const totalAgendamentosMes = sessoesRealizadasMes + faltasCancelamentosMes;
        const taxaFaltas = totalAgendamentosMes > 0 
            ? ((faltasCancelamentosMes / totalAgendamentosMes) * 100).toFixed(1) 
            : 0;

        // --- 5. O CÁLCULO FINANCEIRO (FATURAMENTO DO MÊS) ---
        // O TypeORM possui o método sum() que delega a soma diretamente para o banco de dados (muito mais rápido que fazer um for/map no JavaScript)
        const totalFaturamento = await pagamentoRepo.sum("valor", {
            clinica_id,
            status: "pago",
            data_pagamento: Between(primeiroDiaPagamentoMes, ultimoDiaPagamentoMes)
        });

        return {
            hoje: {
                total_agendamentos: agendamentosHoje,
                proximos_pacientes: proximosAtendimentos
            },
            mes: {
                pacientes_ativos: totalPacientes,
                sessoes_realizadas: sessoesRealizadasMes,
                taxa_de_faltas_percentual: taxaFaltas,
                faturamento_estimado: Number(totalFaturamento) || 0 // <-- Valor em Reais (R$)
            }
        };
    }
}
