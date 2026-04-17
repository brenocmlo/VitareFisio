import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../../appointments/entities/Agendamento";
import { Paciente } from "../../patients/entities/Paciente";
import { Pagamento } from "../../finance/entities/Pagamento"; // <-- Importe o Pagamento
import { Between, In } from "typeorm";

export class GetDashboardMetricsService {
    async execute(clinica_id: number) {
        const pacienteRepo = AppDataSource.getRepository(Paciente);
        const agendamentoRepo = AppDataSource.getRepository(Agendamento);
        const pagamentoRepo = AppDataSource.getRepository(Pagamento); // <-- Novo repositório

        // --- 1. DATAS DE REFERÊNCIA ---
        const hoje = new Date();
        const inicioDoDia = new Date(hoje.setHours(0, 0, 0, 0));
        const fimDoDia = new Date(hoje.setHours(23, 59, 59, 999));
        
        const data = new Date();
        const primeiroDiaDoMes = new Date(data.getFullYear(), data.getMonth(), 1);
        const ultimoDiaDoMes = new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59, 999);

        // --- 2. MÉTRICAS GERAIS ---
        const totalPacientes = await pacienteRepo.count();

        // --- 3. MÉTRICAS DO DIA ---
        const agendamentosHoje = await agendamentoRepo.count({
            where: { clinica_id, data_hora: Between(inicioDoDia, fimDoDia), status: In(["agendado", "confirmado"]) }
        });

        const proximosAtendimentos = await agendamentoRepo.find({
            where: { clinica_id, data_hora: Between(new Date(), fimDoDia), status: In(["agendado", "confirmado"]) },
            order: { data_hora: "ASC" },
            take: 5
        });

        // --- 4. MÉTRICAS MENSAIS (SESSÕES E FALTAS) ---
        const sessoesRealizadasMes = await agendamentoRepo.count({
            where: { clinica_id, data_hora: Between(primeiroDiaDoMes, ultimoDiaDoMes), status: "realizado" }
        });

        const faltasCancelamentosMes = await agendamentoRepo.count({
            where: { clinica_id, data_hora: Between(primeiroDiaDoMes, ultimoDiaDoMes), status: In(["faltou", "cancelado"]) }
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
            data_pagamento: Between(primeiroDiaDoMes, ultimoDiaDoMes)
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