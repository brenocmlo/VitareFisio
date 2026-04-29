import { Request, Response } from "express";
import { CreateFisioterapeutaService } from "../services/CreateFisioterapeutaService";
import { ListFisioterapeutasService } from "../services/ListFisioterapeutasService";
// Importe o serviço de deleção (vamos criá-lo logo abaixo se você não tiver)
import { DeleteFisioterapeutaService } from "../services/DeleteFisioterapeutaService";

export class FisioterapeutaController {
    async create(req: Request, res: Response) {
        try {
            const service = new CreateFisioterapeutaService();
            const profissional = await service.execute(req.body);
            return res.status(201).json(profissional);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async index(req: Request, res: Response) {
        try {
            const { clinica_id } = req.query;
            
            // Prioridade para clinica_id da query, se não houver, usa o do usuário logado
            const targetClinicaId = clinica_id ? Number(clinica_id) : req.user.clinica_id;

            const service = new ListFisioterapeutasService();
            const fisioterapeutas = await service.execute(Number(targetClinicaId));
            
            return res.status(200).json(fisioterapeutas);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    // --- NOVO MÉTODO DE DELEÇÃO ---
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const requesting_user_id = req.user.id;
            const service = new DeleteFisioterapeutaService();
            
            await service.execute(Number(id), requesting_user_id);
            
            return res.status(204).send(); // 204: Sucesso, mas sem conteúdo para retornar
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}