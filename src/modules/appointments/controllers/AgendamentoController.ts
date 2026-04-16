import { Request, Response } from "express";
import { CreateAgendamentoService } from "../services/CreateAgendamentoService";
import { ListAgendamentosService } from "../services/ListAgendamentosService";

export class AgendamentoController {
    async create(req: Request, res: Response) {
        try {
            // Adicionamos o fisioterapeuta_id aqui para não dar erro no banco
            const { paciente_id, fisioterapeuta_id, data_hora, observacoes } = req.body;
            
            const createAgendamentoService = new CreateAgendamentoService();

            const agendamento = await createAgendamentoService.execute({
                paciente_id,
                fisioterapeuta_id, // Enviando para o service
                data_hora,
                observacoes
            });

            return res.status(201).json(agendamento);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async index(req: Request, res: Response) {
        try {
            const listAgendamentosService = new ListAgendamentosService();
            const agendamentos = await listAgendamentosService.execute();

            return res.status(200).json(agendamentos);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}
