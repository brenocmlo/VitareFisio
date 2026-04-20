import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";

interface IRequest {
    agendamento_id: number;
    status: string;
}

export class UpdateAgendamentoStatusService {
    async execute({ agendamento_id, status }: IRequest): Promise<Agendamento> {
        const agendamentoRepository = AppDataSource.getRepository(Agendamento);

        const agendamento = await agendamentoRepository.findOne({ where: { id: agendamento_id } });

        if (!agendamento) {
            throw new Error("Agendamento não encontrado.");
        }

        const allowedStatuses = ["agendado", "confirmado", "realizado", "faltou", "cancelado"];
        if (!allowedStatuses.includes(status)) {
            throw new Error(`Status inválido. Permitidos: ${allowedStatuses.join(", ")}`);
        }

        agendamento.status = status;
        
        await agendamentoRepository.save(agendamento);

        return agendamento;
    }
}
