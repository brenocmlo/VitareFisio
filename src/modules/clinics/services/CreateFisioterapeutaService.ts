import { AppDataSource } from "../../../data-source";
import { Fisioterapeuta } from "../entities/Fisioterapeuta";
import { Clinica } from "../entities/Clinica";

interface IRequest {
    clinica_id: number;
    nome: string;
    crefito: string;
    especialidade?: string;
    email?: string;
}

export class CreateFisioterapeutaService {
    async execute(dados: IRequest) {
        const fisioterapeutaRepository = AppDataSource.getRepository(Fisioterapeuta);
        const clinicaRepository = AppDataSource.getRepository(Clinica);

        // Validar se a clínica existe
        const clinica = await clinicaRepository.findOneBy({ id: dados.clinica_id });
        if (!clinica) throw new Error("Clínica não encontrada.");

        // Validar CREFITO único
        const crefitoExistente = await fisioterapeutaRepository.findOneBy({ crefito: dados.crefito });
        if (crefitoExistente) throw new Error("Já existe um profissional com este CREFITO.");

        const fisioterapeuta = fisioterapeutaRepository.create(dados);
        await fisioterapeutaRepository.save(fisioterapeuta);

        return fisioterapeuta;
    }
}