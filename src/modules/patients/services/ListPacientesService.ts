import { AppDataSource } from "../../../data-source";
import { Paciente } from "../entities/Paciente";

export class ListPacientesService {
    async execute(clinica_id?: number): Promise<any[]> {
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
            .addSelect("paciente.*")
            .addSelect("COALESCE(pacotes.total_restantes, 0)", "sessoes_restantes")
            .addSelect("COALESCE(pacotes.total_pacote, 0)", "sessoes_total");

        if (clinica_id) {
            query.where("paciente.clinica_id = :clinica_id", { clinica_id });
        }

        const results = await query.getRawMany();
        
        return results.map(row => ({
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
        }));
    }
}