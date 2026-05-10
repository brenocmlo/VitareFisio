import { AppDataSource } from "../../../data-source";
import { Paciente } from "../entities/Paciente";

interface IRequest {
    cpf: string;
    clinica_id: number;
    usuario_id: number; // 🔒 RLS
}

export class FindPacienteByCpfService {
    async execute({ cpf, clinica_id, usuario_id }: IRequest): Promise<Paciente | null> {
        const pacienteRepository = AppDataSource.getRepository(Paciente);

        // Busca o paciente apenas se ele pertencer ao usuário logado (RLS)
        const paciente = await pacienteRepository.findOne({
            where: { 
                cpf,
                clinica_id,
                usuario_id
            }
        });

        return paciente;
    }
}