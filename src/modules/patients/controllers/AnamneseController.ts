import { Request, Response } from "express";
import { CreateAnamneseService } from "../services/CreateAnamneseService";
import { GetAnamneseService } from "../services/GetAnamneseService";

export class AnamneseController {
    async createOrUpdate(req: Request, res: Response) {
        try {
            const { paciente_id } = req.params;
            const data = req.body;
            const { id: usuario_id } = req.user; // 🔒 Puxando o id do usuário (RLS)
            
            const createAnamneseService = new CreateAnamneseService();
            const anamnese = await createAnamneseService.execute({
                ...data,
                paciente_id: Number(paciente_id),
                usuario_id: Number(usuario_id) // 🔒 RLS
            });

            return res.status(200).json(anamnese);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async show(req: Request, res: Response) {
        try {
            const { paciente_id } = req.params;
            const { id: usuario_id } = req.user; // 🔒 Puxando o id do usuário (RLS)

            const getAnamneseService = new GetAnamneseService();
            const anamnese = await getAnamneseService.execute(Number(paciente_id), Number(usuario_id)); // 🔒 RLS
            
            return res.status(200).json(anamnese || {});
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}
