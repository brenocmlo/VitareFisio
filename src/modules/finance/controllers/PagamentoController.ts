import { Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { Pagamento } from "../entities/Pagamento";

export class PagamentoController {
    // Lista todos os pagamentos (útil para o financeiro)
    async index(req: Request, res: Response) {
        const repo = AppDataSource.getRepository(Pagamento);
        const pagamentos = await repo.find({ relations: ["paciente"] });
        return res.json(pagamentos);
    }

    // Dá baixa no pagamento (Mudar para 'pago')
    async update(req: Request, res: Response) {
        const { id } = req.params;
        const { forma_pagamento } = req.body;
        
        const repo = AppDataSource.getRepository(Pagamento);
        const pagamento = await repo.findOneBy({ id: Number(id) });

        if (!pagamento) {
            return res.status(404).json({ error: "Lançamento financeiro não encontrado." });
        }

        pagamento.status = "pago";
        pagamento.forma_pagamento = forma_pagamento;
        pagamento.data_pagamento = new Date();

        await repo.save(pagamento);

        return res.json(pagamento);
    }
}