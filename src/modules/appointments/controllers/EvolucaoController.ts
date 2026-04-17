import { Request, Response } from "express";
import { CreateEvolucaoService } from "../services/CreateEvolucaoService";
import { ListEvolucoesByPacienteService } from "../services/ListEvolucoesByPacienteService";
import { UpdateEvolucaoService } from "../services/UpdateEvolucaoService"; // Importe o novo service
import { FinalizeEvolucaoService } from "../services/FinalizeEvolucaoService";
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
    async index(req: Request, res: Response) {
        try {
            const { paciente_id } = req.params;

            const listHistorico = new ListEvolucoesByPacienteService();
            const historico = await listHistorico.execute(Number(paciente_id));

            return res.json(historico);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { descricao, procedimentos } = req.body;

            const updateEvolucao = new UpdateEvolucaoService();

            const evolucao = await updateEvolucao.execute({
                id: Number(id),
                descricao,
                procedimentos
            });

            return res.json(evolucao);
        } catch (error: any) {
            // Se cair na trava das 24h ou da finalização, o erro aparece aqui
            return res.status(400).json({ error: error.message });
        }
    }
    async finalize(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const finalizeEvolucao = new FinalizeEvolucaoService();

            const evolucao = await finalizeEvolucao.execute(Number(id));

            return res.json(evolucao);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}