import { Request, Response } from "express";
import { CreatePagamentoService } from "../services/CreatePagamentoService";
import { ListPagamentosService } from "../services/ListPagamentosService";

export class PagamentoController {
    async create(req: Request, res: Response) {
        try {
            const { paciente_id, clinica_id, agendamento_id, valor, forma_pagamento, status, data_pagamento } = req.body;

            const createPagamento = new CreatePagamentoService();

            const pagamento = await createPagamento.execute({
                paciente_id,
                clinica_id,
                agendamento_id,
                valor,
                forma_pagamento,
                status,
                data_pagamento
            });

            return res.status(201).json(pagamento);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async index(req: Request, res: Response) {
        try {
            const listPagamentosService = new ListPagamentosService();
            const pagamentos = await listPagamentosService.execute();
            return res.status(200).json(pagamentos);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}