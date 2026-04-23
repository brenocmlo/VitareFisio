import { AppDataSource } from "../../../data-source";
import { Paciente } from "../entities/Paciente";

interface IRequest {
    cpf: string;
    clinica_id: number;
}

export class FindPacienteByCpfService {
    async execute({ cpf, clinica_id }: IRequest): Promise<Paciente | null> {
        const pacienteRepository = AppDataSource.getRepository(Paciente);

        // Busca o paciente apenas se ele pertencer à clínica de quem está logado
        const paciente = await pacienteRepository.findOne({
            where: { 
                cpf,
                clinica_id 
            }
        });

        return paciente;
    }
}