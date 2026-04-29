import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Between, Not } from "typeorm";
import {
    addMinutesToAppointmentDateTime,
    normalizeAppointmentDateTime,
} from "../utils/appointmentDateTime";
import { SyncGoogleCalendarService } from "./SyncGoogleCalendarService";

interface IRequest {
    agendamento_id: number;
    nova_data_hora: string;
}

export class RescheduleAgendamentoService {
    async execute({ agendamento_id, nova_data_hora }: IRequest) {
        const agendamentoRepository = AppDataSource.getRepository(Agendamento);

        // 1. Verificar se o agendamento existe
        const agendamento = await agendamentoRepository.findOneBy({ id: agendamento_id });
        if (!agendamento) {
            throw new Error("Agendamento não encontrado.");
        }

        const dataAgendamento = normalizeAppointmentDateTime(nova_data_hora);

        // 2. Verificar conflito de horário (considerando margem de 1h)
        const dataInicio = new Date(addMinutesToAppointmentDateTime(dataAgendamento, -59));
        const dataFim = new Date(addMinutesToAppointmentDateTime(dataAgendamento, 59));

        const conflito = await agendamentoRepository.findOne({
            where: {
                id: Not(agendamento_id),
                fisioterapeuta_id: agendamento.fisioterapeuta_id,
                status: Not("cancelado") as any,
                data_hora: Between(dataInicio, dataFim)
            }
        });

        if (conflito) {
            throw new Error("O novo horário está ocupado por outro agendamento.");
        }

        // 3. Atualizar data e resetar status
        agendamento.data_hora = new Date(dataAgendamento);
        agendamento.data_hora_fim = new Date(addMinutesToAppointmentDateTime(dataAgendamento, 60));
        agendamento.status = "agendado"; 

        await agendamentoRepository.save(agendamento);

        // --- SINCRONIZAÇÃO GOOGLE ---
        const syncGoogle = new SyncGoogleCalendarService();
        syncGoogle.update(agendamento.id).catch(err => {
            console.error("Erro assíncrono ao atualizar no Google:", err);
        });

        return agendamento;
    }
}
