import { Request, Response } from "express";
import { GetPacienteFinanceiroService } from "../services/GetPacienteFinanceiroService";

export class PacienteFinanceiroController {
    async show(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const getPacienteFinanceiroService = new GetPacienteFinanceiroService();

            const extrato = await getPacienteFinanceiroService.execute(Number(id));

            return res.json(extrato);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}