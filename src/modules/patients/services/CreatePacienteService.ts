import { AppDataSource } from "../../../data-source";
import { Paciente } from "../entities/Paciente";

interface IRequest {
    clinica_id: number;
    nome: string;
    cpf: string;
    data_nascimento?: string;
    contato_whatsapp?: string;
    endereco_completo?: string;
    convenio_nome?: string;
    valor_sessao?: number;
}

export class CreatePacienteService {
    async execute(dados: IRequest) {
        const pacienteRepository = AppDataSource.getRepository(Paciente);

        // Verifica duplicidade de CPF
        const pacienteExistente = await pacienteRepository.findOneBy({ cpf: dados.cpf });
        if (pacienteExistente) {
            throw new Error("Paciente já cadastrado com este CPF.");
        }

        const paciente = pacienteRepository.create(dados);
        await pacienteRepository.save(paciente);

        return paciente;
    }
}