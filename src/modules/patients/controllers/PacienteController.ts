import { Request, Response } from "express";
import { CreatePacienteService } from "../services/CreatePacienteService";
import { ListPacientesService } from "../services/ListPacientesService";

export class PacienteController {
    
    // 1. MÉTODO DE CRIAÇÃO (POST)
    async create(req: Request, res: Response) {
        try {
            // O req.body já vem validado pelo middleware do Zod
            const data = req.body;
            const createPacienteService = new CreatePacienteService();
            const paciente = await createPacienteService.execute(data);

            return res.status(201).json(paciente);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    // 2. MÉTODO DE LISTAGEM (GET) com filtro de Clínica
    async index(req: Request, res: Response) {
        try {
            // Filtro opcional por ID da clínica: /pacientes?clinica_id=1
            const { clinica_id } = req.query;

            const listPacientesService = new ListPacientesService();
            
            // Passamos o filtro para o Service de listagem
            const pacientes = await listPacientesService.execute(
                clinica_id ? Number(clinica_id) : undefined
            );

            return res.status(200).json(pacientes);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}