import { Request, Response } from "express";
import { CreatePagamentoService } from "../services/CreatePagamentoService";
import { ListPagamentosService } from "../services/ListPagamentosService";

export class PagamentoController {
    async create(req: Request, res: Response) {
        try {
            const { 
                paciente_id, 
                valor, 
                forma_pagamento, 
                agendamento_id, 
                is_pacote, 
                quantidade_sessoes,
                clinica_id // <--- Adicionamos aqui para o caso do frontend enviar
            } = req.body;
            
            // --- O SEGREDO ESTÁ AQUI ---
            // Tenta usar o clinica_id do Frontend. Se não vier, tenta do Token. Se falhar, usa 1 (Padrão para Autônomos).
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
                valor,
                forma_pagamento,
                agendamento_id,
                is_pacote,
                quantidade_sessoes
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
