import { Request, Response } from "express";
import { CreatePagamentoService } from "../services/CreatePagamentoService";
import { ListPagamentosService } from "../services/ListPagamentosService";

export class PagamentoController {
    async create(req: Request, res: Response) {
        try {
            const {
                paciente_id,
                clinica_id,
                agendamento_id,
                valor,
                forma_pagamento,
                status,
                data_pagamento,
                is_pacote,
                quantidade_sessoes
            } = req.body;

            // Resolução de clinica_id: tenta frontend → token → fallback 1 (autônomo)
            let clinicaIdResolvido: number | undefined =
                typeof clinica_id === "number" ? clinica_id : undefined;

            if (!clinicaIdResolvido && req.user) {
                clinicaIdResolvido = req.user.clinica_id || Number(req.user.id);
            }

            if (!clinicaIdResolvido) {
                clinicaIdResolvido = 1;
            }

            const createPagamentoService = new CreatePagamentoService();

            const pagamento = await createPagamentoService.execute({
                paciente_id,
                clinica_id: clinicaIdResolvido,
                agendamento_id,
                valor,
                forma_pagamento,
                status,
                data_pagamento,
                is_pacote: Boolean(is_pacote),
                quantidade_sessoes: quantidade_sessoes ? Number(quantidade_sessoes) : 1
            });

            return res.status(201).json(pagamento);
        } catch (error: any) {
            console.error("Erro ao registrar pagamento:", error.message);
            return res.status(400).json({ error: error.message });
        }
    }

    async index(req: Request, res: Response) {
        try {
            let clinicaIdResolvido = req.user?.clinica_id || Number(req.user?.id);
            if (!clinicaIdResolvido) {
                clinicaIdResolvido = 1;
            }

            const listPagamentosService = new ListPagamentosService();
            const pagamentos = await listPagamentosService.execute(clinicaIdResolvido);

            return res.status(200).json(pagamentos);
        } catch (error: any) {
            console.error("Erro na listagem financeira:", error.message);
            return res.status(400).json({ error: error.message });
        }
    }
}
