import { Request, Response } from "express";
import { CreatePagamentoService } from "../services/CreatePagamentoService";
import { ListPagamentosService } from "../services/ListPagamentosService";
import { DeletePagamentoService } from "../services/DeletePagamentoService";

export class PagamentoController {
    async create(req: Request, res: Response) {
        try {
            const {
                paciente_id,
                clinica_id,
                agendamento_id,
                valor,
                forma_pagamento,
                metodo_pagamento, // Adicionado para suportar ambos os nomes de campo
                status,
                data_pagamento,
                is_pacote,
                quantidade_sessoes
            } = req.body;

            // Resolução de clinica_id: tenta frontend → token → fallback 1 (autônomo)
            let clinicaIdResolvido: number | undefined =
                typeof clinica_id === "number" ? clinica_id : undefined;

            if (!clinicaIdResolvido && req.user) {
                clinicaIdResolvido = (req.user as any).clinica_id || Number(req.user.id);
            }

            if (!clinicaIdResolvido) {
                clinicaIdResolvido = 1;
            }

            const createPagamentoService = new CreatePagamentoService();

            const pagamento = await createPagamentoService.execute({
                paciente_id: Number(paciente_id),
                clinica_id: clinicaIdResolvido,
                agendamento_id: agendamento_id ? Number(agendamento_id) : undefined,
                valor: Number(valor),
                forma_pagamento: forma_pagamento || metodo_pagamento,
                status,
                data_pagamento,
                is_pacote: is_pacote === true || is_pacote === 'true',
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

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const clinica_id = req.user?.clinica_id || Number(req.user?.id) || 1;
            const user_id = req.user?.id;

            // Validar se o ID é válido
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: "ID inválido." });
            }

            const deletePagamentoService = new DeletePagamentoService();
            const resultado = await deletePagamentoService.execute({
                id: Number(id),
                clinica_id: Number(clinica_id),
                user_id: user_id as string
            });

            return res.status(200).json({
                message: "Lançamento removido com sucesso.",
                id: resultado.id
            });
        } catch (error: any) {
            console.error("Erro ao remover pagamento:", error.message);

            // Erro 404: Não encontrado
            if (error.message.includes("não encontrado")) {
                return res.status(404).json({ error: error.message });
            }

            // Erro 500: Genérico
            return res.status(500).json({ error: "Erro ao remover lançamento." });
        }
    }
}
