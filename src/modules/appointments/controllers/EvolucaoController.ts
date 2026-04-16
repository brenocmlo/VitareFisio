import { Request, Response } from "express";
import { CreateEvolucaoService } from "../services/CreateEvolucaoService";

export class EvolucaoController {
    // O nome do método deve ser exatamente 'create'
    async create(req: Request, res: Response) { 
        try {
            const { agendamento_id, paciente_id, descricao, procedimentos } = req.body;
            const createEvolucaoService = new CreateEvolucaoService();

            const evolucao = await createEvolucaoService.execute({
                agendamento_id,
                paciente_id,
                descricao,
                procedimentos
            });

            return res.status(201).json(evolucao);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}