import { AppDataSource } from "../../../data-source";
import { PacienteAnexo } from "../entities/PacienteAnexo";

export class ListAnexosByPacienteService {
  async execute(paciente_id: number, clinica_id?: number) {
    const repo = AppDataSource.getRepository(PacienteAnexo);

    // O Postgres exige que o filtro seja exatamente do tipo da coluna (integer)
    const anexos = await repo.find({
      where: {
        paciente_id: Number(paciente_id),
        // Só aplica o filtro de clinica_id se ele existir e for um número válido
        ...(clinica_id ? { clinica_id: Number(clinica_id) } : {})
      },
      order: {
        data_criacao: "DESC"
      }
    });

    return anexos;
  }
}