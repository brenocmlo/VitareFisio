import { Request, Response } from "express";
import { ListPacotesByPacienteService } from "../services/ListPacotesByPacienteService";

export class PacoteController {
    async index(req: Request, res: Response) {
        try {
            const { paciente_id } = req.params;
            const { clinica_id } = req.user as any;

            const listPacotes = new ListPacotesByPacienteService();
            const pacotes = await listPacotes.execute(Number(paciente_id), Number(clinica_id));

            return res.json(pacotes);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}
