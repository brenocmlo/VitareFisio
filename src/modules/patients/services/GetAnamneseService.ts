import { AppDataSource } from "../../../data-source";
import { Anamnese } from "../entities/Anamnese";
import { Paciente } from "../entities/Paciente";

export class GetAnamneseService {
    async execute(paciente_id: number, usuario_id: number): Promise<Anamnese | null> {
        const pacienteRepository = AppDataSource.getRepository(Paciente);
        const paciente = await pacienteRepository.findOneBy({ id: paciente_id });

        if (!paciente || paciente.usuario_id !== usuario_id) {
            throw new Error("Acesso negado: Você não tem permissão para ver os registros deste paciente (LGPD).");
        }

        const anamneseRepository = AppDataSource.getRepository(Anamnese);
        const anamnese = await anamneseRepository.findOne({ where: { paciente_id } });
        return anamnese;
    }
}
