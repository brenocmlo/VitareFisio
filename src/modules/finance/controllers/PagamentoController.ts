import { Request, Response } from "express";
import { CreatePagamentoService } from "../services/CreatePagamentoService";

export class PagamentoController {
    async create(req: Request, res: Response) {
        try {
            const { paciente_id, agendamento_id, valor, forma_pagamento } = req.body;
            
            const createPagamentoService = new CreatePagamentoService();

            const pagamento = await createPagamentoService.execute({
                paciente_id,
                agendamento_id,
                valor,
                forma_pagamento
            });

            return res.status(201).json(pagamento);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}