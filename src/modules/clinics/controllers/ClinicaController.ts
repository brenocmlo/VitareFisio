import { Request, Response } from "express";
import { CreateClinicaService } from "../services/CreateClinicaService";

export class ClinicaController {
    async create(req: Request, res: Response) {
        try {
            const service = new CreateClinicaService();
            const clinica = await service.execute(req.body);
            return res.status(201).json(clinica);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}