import { Request, Response } from "express";
import { CreatePacienteService } from "../services/CreatePacienteService";
import { ListPacientesService } from "../services/ListPacientesService";

export class PacienteController {
    
    // 1. MÉTODO DE CRIAÇÃO (POST)
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

    // 2. MÉTODO DE LISTAGEM (GET)
    async index(req: Request, res: Response) {
        try {
            const listPacientesService = new ListPacientesService();
            const pacientes = await listPacientesService.execute();

            return res.status(200).json(pacientes);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}