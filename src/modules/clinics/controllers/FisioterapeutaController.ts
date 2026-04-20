import { Request, Response } from "express";
import { CreateFisioterapeutaService } from "../services/CreateFisioterapeutaService";
import { ListFisioterapeutasService } from "../services/ListFisioterapeutasService";

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
            const service = new ListFisioterapeutasService();
            const fisioterapeutas = await service.execute(clinica_id ? Number(clinica_id) : undefined);
            return res.status(200).json(fisioterapeutas);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}