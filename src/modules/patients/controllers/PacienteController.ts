import { Request, Response } from "express";
import { CreatePacienteService } from "../services/CreatePacienteService";
import { ListPacientesService } from "../services/ListPacientesService";
import { DeletePacienteService } from "../services/DeletePacienteService";
import { FindPacienteByCpfService } from "../services/FindPacienteByCpfService"; // <-- Novo Import
import { AppDataSource } from "../../../data-source";
import { Paciente } from "../entities/Paciente";
import { string } from "zod";

export class PacienteController {

    // POST /pacientes
    async create(req: Request, res: Response) {
        try {
            const data = req.body;
            const createPacienteService = new CreatePacienteService();
            const paciente = await createPacienteService.execute(data);
            return res.status(201).json(paciente);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    // GET /pacientes
    async index(req: Request, res: Response) {
        try {
            const { search, page, limit } = req.query;
            // 🔒 SEGURANÇA: clinica_id sempre vem do token JWT, nunca da URL
            const { clinica_id } = req.user;

            const listPacientesService = new ListPacientesService();
            const result = await listPacientesService.execute(
                Number(clinica_id),
                search ? String(search) : undefined,
                page ? Number(page) : 1,
                limit ? Number(limit) : 20
            );
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    // GET /pacientes/:id
    async show(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { clinica_id } = req.user as any; // 🔒 Puxando direto do Token JWT

            const pacienteRepo = AppDataSource.getRepository(Paciente);
            
            const query = pacienteRepo.createQueryBuilder("paciente")
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
                .addSelect("COALESCE(pacotes.total_pacote, 0)", "sessoes_total")
                .where("paciente.id = :id", { id: Number(id) })
                .andWhere("paciente.clinica_id = :clinica_id", { clinica_id: Number(clinica_id) });

            const row = await query.getRawOne();

            if (!row) {
                return res.status(404).json({ error: "Paciente não encontrado." });
            }

            const paciente = {
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
            };

            return res.json(paciente);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    // DELETE /pacientes/:id
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { clinica_id } = req.user as any; // 🔒 Puxando direto do Token JWT

            const deletePacienteService = new DeletePacienteService();
            await deletePacienteService.execute({
                id: Number(id),
                clinica_id: Number(clinica_id)
            });

            return res.status(200).json({ message: "Paciente removido com sucesso." });
        } catch (error: any) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: "Erro ao remover paciente." });
        }
    }

    // GET /pacientes/cpf/:cpf (NOVO - FINANCEIRO INTELIGENTE)
    async showByCpf(req: Request, res: Response) {
        try {
            const { cpf } = req.params;
            const { clinica_id } = req.user as any; // 🔒 Puxando direto do Token JWT

            const service = new FindPacienteByCpfService();
            const paciente = await service.execute({ 
                cpf : string().parse(cpf), // Validação básica de CPF
                clinica_id: Number(clinica_id) 
            });

            if (!paciente) {
                return res.status(404).json({ error: "Paciente não encontrado nesta clínica." });
            }

            return res.json(paciente);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}