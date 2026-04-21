import { AppDataSource } from "../../../data-source";
import { PacotePaciente } from "../entities/PacotePaciente";

export class ListPacotesByPacienteService {
    async execute(paciente_id: number, clinica_id: number): Promise<PacotePaciente[]> {
        const pacoteRepo = AppDataSource.getRepository(PacotePaciente);

        const pacotes = await pacoteRepo.find({
            where: { paciente_id, clinica_id },
            order: { data_compra: "DESC" }
        });

        return pacotes;
    }
}
