import { AppDataSource } from "../../../data-source";
import { Paciente } from "../entities/Paciente";

export class ListPacientesService {
    async execute(): Promise<Paciente[]> {
        const pacienteRepository = AppDataSource.getRepository(Paciente);
        
        // O método .find() busca todos os registros da tabela
        const pacientes = await pacienteRepository.find();
        
        return pacientes;
    }
}