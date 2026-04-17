import { Request, Response } from "express";
import { CreateFisioterapeutaService } from "../service/CreateFisioterapeutaService";

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
}