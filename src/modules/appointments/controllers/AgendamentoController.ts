import { Request, Response } from "express";
import { CreateAgendamentoService } from "../services/CreateAgendamentoService";
import { ListAgendamentosService } from "../services/ListAgendamentosService";
import { RescheduleAgendamentoService } from "../services/RescheduleAgendamentoService";
import { GenerateWhatsAppLinkService } from "../services/GenerateWhatsAppLinkService"; 
import { UpdateAgendamentoStatusService } from "../services/UpdateAgendamentoStatusService";
import { CancelAgendamentoService } from "../services/CancelAgendamentoService";

export class AgendamentoController {
    async create(req: Request, res: Response) {
        try {
            const { 
                paciente_id, 
                data_hora, 
                observacoes, 
                clinica_id, 
                fisioterapeuta_id 
            } = req.body;

            const createAgendamento = new CreateAgendamentoService();

            const agendamento = await createAgendamento.execute({
                paciente_id: Number(paciente_id),
                data_hora,
                observacoes,
                clinica_id: Number(clinica_id),
                fisioterapeuta_id: Number(fisioterapeuta_id),
                status: "agendado"
            });

            return res.status(201).json(agendamento);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async index(req: Request, res: Response) {
        try {
            // --- CAPTURANDO OS NOVOS FILTROS DA URL ---
            const { data, mes, ano, fisioterapeuta_id } = req.query;
            
            // Prioridade para o ID que vem na query, se não, usa o do usuário logado
            const fisioId = fisioterapeuta_id ? Number(fisioterapeuta_id) : req.user?.id;

            const listAgendamentosService = new ListAgendamentosService();
            
            // Passamos o objeto completo com os filtros para o Service
            const agendamentos = await listAgendamentosService.execute({
                data: data as string,
                mes: mes as string,
                ano: ano as string,
                fisioterapeuta_id: Number(fisioId)
            });

            return res.status(200).json(agendamentos);
        } catch (error: any) {
            console.error("❌ ERRO NO INDEX DE AGENDAMENTOS:", error);
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

    async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updateStatusService = new UpdateAgendamentoStatusService();
            const agendamento = await updateStatusService.execute({
                agendamento_id: Number(id),
                status
            });
            return res.status(200).json(agendamento);
        }  catch (error: any) {
            console.error("❌ ERRO NO STATUS:", error);
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

   async cancel(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const service = new CancelAgendamentoService();
            
            const agendamento = await service.execute({ agendamento_id: Number(id) });
            
            return res.status(200).json(agendamento);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

}