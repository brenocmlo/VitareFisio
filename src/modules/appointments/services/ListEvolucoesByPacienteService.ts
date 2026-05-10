import { AppDataSource } from "../../../data-source";
import { Evolucao } from "../entities/Evolucao";
import { Paciente } from "../../patients/entities/Paciente";

export class ListEvolucoesByPacienteService {
    async execute(paciente_id: number, usuario_id: number) { // 🔒 RLS
        const pacienteRepository = AppDataSource.getRepository(Paciente);
        const paciente = await pacienteRepository.findOneBy({ id: paciente_id });

        if (!paciente || paciente.usuario_id !== usuario_id) {
            throw new Error("Acesso negado: Você não tem permissão para ver os registros deste paciente (LGPD).");
        }

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