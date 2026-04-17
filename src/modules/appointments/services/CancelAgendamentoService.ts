import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";

export class CancelAgendamentoService {
    async execute(id: number) {
        const repo = AppDataSource.getRepository(Agendamento);
        
        const agendamento = await repo.findOneBy({ id });

        if (!agendamento) {
            throw new Error("Agendamento não encontrado.");
        }

        // Em vez de deletar fisicamente, mudamos o status para liberar a agenda
        agendamento.status = 'cancelado';
        
        await repo.save(agendamento);

        return agendamento;
    }
}