import { AppDataSource } from "../../../data-source";
import { Paciente } from "../entities/Paciente";

// Tipagem dos dados que esperamos receber
interface IRequest {
    clinica_id: number;
    nome: string;
    cpf: string;
    data_nascimento?: string;
    contato_whatsapp?: string;
    endereco_completo?: string;
    convenio_nome?: string;
}

export class CreatePacienteService {
    async execute(data: IRequest): Promise<Paciente> {
        // Pega o repositório do TypeORM para manipular a tabela de pacientes
        const pacienteRepository = AppDataSource.getRepository(Paciente);

        // REGRA DE NEGÓCIO 1: Verificar se o CPF já existe
        const pacienteExists = await pacienteRepository.findOneBy({ cpf: data.cpf });
        
        if (pacienteExists) {
            throw new Error("Já existe um paciente cadastrado com este CPF.");
        }

        // REGRA DE NEGÓCIO 2: Criar a instância e salvar
        const paciente = pacienteRepository.create(data);
        await pacienteRepository.save(paciente);

        return paciente;
    }
}