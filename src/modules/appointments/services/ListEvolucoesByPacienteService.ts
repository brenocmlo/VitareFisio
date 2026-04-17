import { AppDataSource } from "../../../data-source";
import { Evolucao } from "../entities/Evolucao";

export class ListEvolucoesByPacienteService {
    async execute(paciente_id: number) {
        const evolucaoRepository = AppDataSource.getRepository(Evolucao);

        // Procuramos todas as evoluções do paciente
        const historico = await evolucaoRepository.find({
            where: { paciente_id },
            order: { data_criacao: "DESC" }, // Mais recentes primeiro
            relations: ["agendamento"] // Opcional: para saber a data da sessão
        });

        return historico;
    }
}