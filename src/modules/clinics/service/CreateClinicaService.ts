import { AppDataSource } from "../../../data-source";
import { Clinica } from "../entities/Clinica";

interface IRequest {
    nome_fantasia: string;
    razao_social?: string;
    cnpj?: string;
    telefone?: string;
    endereco?: string;
}

export class CreateClinicaService {
    async execute(dados: IRequest) {
        const clinicaRepository = AppDataSource.getRepository(Clinica);

        if (dados.cnpj) {
            const clinicaExistente = await clinicaRepository.findOneBy({ cnpj: dados.cnpj });
            if (clinicaExistente) throw new Error("Já existe uma clínica com este CNPJ.");
        }

        const clinica = clinicaRepository.create(dados);
        await clinicaRepository.save(clinica);

        return clinica;
    }
}