import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Between, Not } from "typeorm";

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

        const dataAgendamento = new Date(nova_data_hora);

        // 2. Verificar conflito de horário (considerando margem de 1h)
        const dataInicio = new Date(dataAgendamento);
        dataInicio.setMinutes(dataInicio.getMinutes() - 59);
        const dataFim = new Date(dataAgendamento);
        dataFim.setMinutes(dataFim.getMinutes() + 59);

        const conflito = await agendamentoRepository.findOne({
            where: {
                id: Not(agendamento_id), // Ignora o próprio agendamento na verificação
                fisioterapeuta_id: agendamento.fisioterapeuta_id,
                data_hora: Between(dataInicio, dataFim)
            }
        });

        if (conflito) {
            throw new Error("O novo horário está ocupado por outro agendamento.");
        }

        // 3. Atualizar data e resetar status
        agendamento.data_hora = dataAgendamento;
        agendamento.status = "agendado"; 

        await agendamentoRepository.save(agendamento);

        return agendamento;
    }
}