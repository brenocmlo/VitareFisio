import { Request, Response } from "express";
import { CreateAgendamentoService } from "../services/CreateAgendamentoService";
import { ListAgendamentosService } from "../services/ListAgendamentosService";
import { RescheduleAgendamentoService } from "../services/RescheduleAgendamentoService";
import { GenerateWhatsAppLinkService } from "../services/GenerateWhatsAppLinkService"; 
// Adicione este import lá no topo:
import { CancelAgendamentoService } from "../services/CancelAgendamentoService";
export class AgendamentoController {
    async create(req: Request, res: Response) {
        try {
            // <-- clinica_id EXTRAÍDO AQUI
            const { paciente_id, clinica_id, fisioterapeuta_id, data_hora, observacoes } = req.body;
            
            const createAgendamentoService = new CreateAgendamentoService();

            const agendamento = await createAgendamentoService.execute({
                paciente_id,
                clinica_id, // <-- PASSADO PARA O SERVICE
                fisioterapeuta_id,
                data_hora,
                observacoes
            });

            return res.status(201).json(agendamento);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    // ... os seus métodos index, update e generateReminder continuam IGUAIS aqui para baixo ...
    async index(req: Request, res: Response) {
        try {
            const { fisioterapeuta_id } = req.query;
            const listAgendamentosService = new ListAgendamentosService();
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

    async generateReminder(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const generateLink = new GenerateWhatsAppLinkService();
            const result = await generateLink.execute(Number(id));
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
    async delete(req: Request, res: Response) {
    try {
        const { id } = req.params;
        
        const cancelAgendamento = new CancelAgendamentoService();
        await cancelAgendamento.execute(Number(id));
        
        // Retornamos 204 (No Content) que é o padrão para deleções bem sucedidas
            return res.status(204).send(); 
     }  catch (error: any) {
            return res.status(400).json({ error: error.message });
    }
}
}