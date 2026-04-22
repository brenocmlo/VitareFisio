import { AppDataSource } from "../../../data-source";
import { PacienteAnexo } from "../entities/PacienteAnexo";

export class ListAnexosByPacienteService {
    async execute(paciente_id: number, clinica_id?: number): Promise<PacienteAnexo[]> {
        const repo = AppDataSource.getRepository(PacienteAnexo);

        const where: any = { paciente_id };
        // Filtra por clinica_id quando disponível (registos antigos podem não ter)
        if (clinica_id) {
            where.clinica_id = clinica_id;
        }

        const anexos = await repo.find({
            where,
            order: { data_criacao: "DESC" }
        });

        return anexos;
    }
}
