import { Request, Response } from "express";
import { CreateAgendamentoService } from "../services/CreateAgendamentoService";
import { ListAgendamentosService } from "../services/ListAgendamentosService";
import { RescheduleAgendamentoService } from "../services/RescheduleAgendamentoService";

export class AgendamentoController {
    async create(req: Request, res: Response) {
        try {
            const { paciente_id, fisioterapeuta_id, data_hora, observacoes } = req.body;
            
            const createAgendamentoService = new CreateAgendamentoService();

            const agendamento = await createAgendamentoService.execute({
                paciente_id,
                fisioterapeuta_id,
                data_hora,
                observacoes
            });

            return res.status(201).json(agendamento);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    // MÉTODO ATUALIZADO PARA FILTRAR POR PROFISSIONAL
    async index(req: Request, res: Response) {
        try {
            // Capturamos o ID da query string (Ex: /agendamentos?fisioterapeuta_id=1)
            const { fisioterapeuta_id } = req.query;

            const listAgendamentosService = new ListAgendamentosService();

            // Passamos o ID convertido para número para o Service
            // Se não houver ID na query, o service listará todos normalmente
            const agendamentos = await listAgendamentosService.execute(
                fisioterapeuta_id ? Number(fisioterapeuta_id) : undefined
            );

            return res.status(200).json(agendamentos);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { data_hora } = req.body;

            const rescheduleAgendamentoService = new RescheduleAgendamentoService();

            const agendamento = await rescheduleAgendamentoService.execute({
                agendamento_id: Number(id),
                nova_data_hora: data_hora
            });

            return res.status(200).json(agendamento);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}