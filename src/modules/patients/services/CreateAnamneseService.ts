import { AppDataSource } from "../../../data-source";
import { Anamnese } from "../entities/Anamnese";
import { Paciente } from "../entities/Paciente";

interface IRequest {
    paciente_id: number;
    queixa_principal?: string;
    historico_doenca_atual?: string;
    historico_patologico_pregresso?: string;
    medicamentos_em_uso?: string;
    exames_complementares?: string;
    observacoes?: string;
    usuario_id: number; // 🔒 RLS
}

export class CreateAnamneseService {
    async execute(data: IRequest): Promise<Anamnese> {
        const pacienteRepository = AppDataSource.getRepository(Paciente);
        const paciente = await pacienteRepository.findOneBy({ id: data.paciente_id });

        if (!paciente || paciente.usuario_id !== data.usuario_id) {
            throw new Error("Acesso negado: Você não tem permissão para alterar os registros deste paciente (LGPD).");
        }

        const anamneseRepository = AppDataSource.getRepository(Anamnese);

        // Check if Anamnese already exists for this patient
        let anamnese = await anamneseRepository.findOne({ where: { paciente_id: data.paciente_id } });

        if (anamnese) {
            // Update existing
            anamnese = anamneseRepository.merge(anamnese, data);
        } else {
            // Create new
            anamnese = anamneseRepository.create(data);
        }

        await anamneseRepository.save(anamnese);

        return anamnese;
    }
}
