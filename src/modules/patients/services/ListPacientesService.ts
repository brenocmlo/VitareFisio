import { AppDataSource } from "../../../data-source";
import { Paciente } from "../entities/Paciente";

export class ListPacientesService {
    async execute(clinica_id?: number): Promise<Paciente[]> {
        const pacienteRepository = AppDataSource.getRepository(Paciente);

        if (clinica_id) {
            return pacienteRepository.find({
                where: { clinica_id }
            });
        }

        return pacienteRepository.find();
    }
}