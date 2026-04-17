import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";

export class ListAgendamentosService {
    // Adicionamos o parâmetro opcional 'fisioterapeuta_id'
    async execute(fisioterapeuta_id?: number): Promise<Agendamento[]> {
        const agendamentoRepository = AppDataSource.getRepository(Agendamento);
        
        // Criamos o objeto de busca
        const queryOptions: any = {
            relations: ["paciente"],
            order: { data_hora: "ASC" }
        };

        // Se o ID foi passado, adicionamos a cláusula WHERE
        if (fisioterapeuta_id) {
            queryOptions.where = { fisioterapeuta_id };
        }

        const agendamentos = await agendamentoRepository.find(queryOptions);
        
        return agendamentos;
    }
}