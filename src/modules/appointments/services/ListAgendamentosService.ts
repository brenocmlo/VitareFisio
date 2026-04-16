import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";

export class ListAgendamentosService {
    async execute(): Promise<Agendamento[]> {
        const agendamentoRepository = AppDataSource.getRepository(Agendamento);
        
        // Buscamos todos os agendamentos e pedimos para o TypeORM 
        // trazer também os dados do paciente relacionado
        const agendamentos = await agendamentoRepository.find({
            relations: ["paciente"],
            order: { data_hora: "ASC" }
        });
        
        return agendamentos;
    }
}