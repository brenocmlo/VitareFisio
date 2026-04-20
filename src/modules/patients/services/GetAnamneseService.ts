import { AppDataSource } from "../../../data-source";
import { Anamnese } from "../entities/Anamnese";

export class GetAnamneseService {
    async execute(paciente_id: number): Promise<Anamnese | null> {
        const anamneseRepository = AppDataSource.getRepository(Anamnese);
        const anamnese = await anamneseRepository.findOne({ where: { paciente_id } });
        return anamnese;
    }
}
