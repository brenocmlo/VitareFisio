import { AppDataSource } from "../../../data-source";
import { Fisioterapeuta } from "../entities/Fisioterapeuta";

export class ListFisioterapeutasService {
    async execute(clinica_id?: number) {
        const fisioterapeutaRepository = AppDataSource.getRepository(Fisioterapeuta);

        let whereCondition = {};
        if (clinica_id) {
            whereCondition = { clinica_id };
        }

        const fisioterapeutas = await fisioterapeutaRepository.find({
            where: whereCondition,
            order: { nome: "ASC" },
        });

        return fisioterapeutas;
    }
}
