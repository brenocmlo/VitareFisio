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
            const { clinica_id } = req.query;
            const listPacientesService = new ListPacientesService();
            const pacientes = await listPacientesService.execute(
                clinica_id ? Number(clinica_id) : undefined
            );
            return res.status(200).json(pacientes);
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
            const paciente = await pacienteRepo.findOneBy({
                id: Number(id),
                clinica_id: Number(clinica_id)
            });

            if (!paciente) {
                return res.status(404).json({ error: "Paciente não encontrado." });
            }

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