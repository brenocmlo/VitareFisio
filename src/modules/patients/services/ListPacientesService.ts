import { AppDataSource } from "../../../data-source";
import { Paciente } from "../entities/Paciente";

export class ListPacientesService {
    async execute(clinica_id?: number, search?: string, page = 1, limit = 20): Promise<{ data: any[], total: number }> {
        const pacienteRepository = AppDataSource.getRepository(Paciente);
 
        const query = pacienteRepository.createQueryBuilder("paciente")
            .leftJoin(
                qb => qb
                    .select("paciente_id")
                    .addSelect("SUM(sessoes_restantes)", "total_restantes")
                    .addSelect("SUM(sessoes_total)", "total_pacote")
                    .from("pacotes_pacientes", "pacote")
                    .where("status_pagamento = :status", { status: "pago" })
                    .groupBy("paciente_id"),
                "pacotes",
                "pacotes.paciente_id = paciente.id"
            )
            .addSelect("paciente.id", "id")
            .addSelect("paciente.nome", "nome")
            .addSelect("paciente.cpf", "cpf")
            .addSelect("paciente.data_nascimento", "data_nascimento")
            .addSelect("paciente.contato_whatsapp", "contato_whatsapp")
            .addSelect("paciente.endereco_completo", "endereco_completo")
            .addSelect("paciente.valor_sessao", "valor_sessao")
            .addSelect("paciente.clinica_id", "clinica_id")
            .addSelect("COALESCE(pacotes.total_restantes, 0)", "sessoes_restantes")
            .addSelect("COALESCE(pacotes.total_pacote, 0)", "sessoes_total")
            .orderBy("paciente.nome", "ASC");
 
        if (clinica_id) {
            query.andWhere("paciente.clinica_id = :clinica_id", { clinica_id });
        }

        if (search) {
            query.andWhere("(paciente.nome ILIKE :search OR paciente.cpf LIKE :search)", { search: `%${search}%` });
        }

        const total = await query.getCount();
        const results = await query
            .offset((page - 1) * limit)
            .limit(limit)
            .getRawMany();
        
        return {
            data: results.map(row => ({
                id: row.id,
                nome: row.nome,
                cpf: row.cpf,
                data_nascimento: row.data_nascimento,
                contato_whatsapp: row.contato_whatsapp,
                endereco_completo: row.endereco_completo,
                valor_sessao: row.valor_sessao,
                clinica_id: row.clinica_id,
                sessoes_restantes: Number(row.sessoes_restantes || 0),
                sessoes_total: Number(row.sessoes_total || 0)
            })),
            total
        };
    }
}