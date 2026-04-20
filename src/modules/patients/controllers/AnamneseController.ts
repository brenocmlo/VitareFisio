import { Request, Response } from "express";
import { CreateAnamneseService } from "../services/CreateAnamneseService";
import { GetAnamneseService } from "../services/GetAnamneseService";

export class AnamneseController {
    async createOrUpdate(req: Request, res: Response) {
        try {
            const { paciente_id } = req.params;
            const data = req.body;
            
            const createAnamneseService = new CreateAnamneseService();
            const anamnese = await createAnamneseService.execute({
                ...data,
                paciente_id: Number(paciente_id)
            });

            return res.status(200).json(anamnese);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async show(req: Request, res: Response) {
        try {
            const { paciente_id } = req.params;
            const getAnamneseService = new GetAnamneseService();
            const anamnese = await getAnamneseService.execute(Number(paciente_id));
            
            return res.status(200).json(anamnese || {});
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}
