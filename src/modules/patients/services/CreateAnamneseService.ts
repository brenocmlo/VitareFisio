import { AppDataSource } from "../../../data-source";
import { Anamnese } from "../entities/Anamnese";

interface IRequest {
    paciente_id: number;
    queixa_principal?: string;
    historico_doenca_atual?: string;
    historico_patologico_pregresso?: string;
    medicamentos_em_uso?: string;
    exames_complementares?: string;
    observacoes?: string;
}

export class CreateAnamneseService {
    async execute(data: IRequest): Promise<Anamnese> {
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
