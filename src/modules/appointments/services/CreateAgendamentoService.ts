import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Paciente } from "../../patients/entities/Paciente";
import { Not, Between } from "typeorm";
import { SyncGoogleCalendarService } from "./SyncGoogleCalendarService";

interface IRequest {
    paciente_id: number;
    clinica_id: number;
    fisioterapeuta_id: number;
    data_hora: string;
    observacoes?: string;
    status?: string;
}

export class CreateAgendamentoService {
    async execute({ paciente_id, clinica_id, fisioterapeuta_id, data_hora, observacoes }: IRequest): Promise<Agendamento> {
        const agendamentoRepository = AppDataSource.getRepository(Agendamento);
        const pacienteRepository = AppDataSource.getRepository(Paciente);

        const paciente = await pacienteRepository.findOneBy({ id: paciente_id });
        if (!paciente) {
            throw new Error("Paciente não encontrado.");
        }

        const dataInicio = new Date(data_hora);
        if (isNaN(dataInicio.getTime())) {
             throw new Error("Data inválida");
        }

        const dataFim = new Date(dataInicio.getTime() + 60 * 60 * 1000);

        // Define a window of 1 minute less than the appointment duration to check for conflicts
        // This allows back-to-back appointments
        const conflitoStart = new Date(dataInicio.getTime() + 1000); // +1 second
        const conflitoEnd = new Date(dataFim.getTime() - 1000); // -1 second

        const conflito = await agendamentoRepository.findOne({
            where: {
                data_hora: Between(conflitoStart, conflitoEnd),
                fisioterapeuta_id: Number(fisioterapeuta_id),
                status: Not("cancelado") 
            }
        });

        if (conflito) {
            throw new Error("Este horário já está ocupado na sua agenda.");
        }

        const agendamento = agendamentoRepository.create({
            paciente_id,
            clinica_id,
            fisioterapeuta_id,
            data_hora: dataInicio,
            data_hora_fim: dataFim,
            observacoes,
            status: "agendado" 
        });

        await agendamentoRepository.save(agendamento);

        // --- SINCRONIZAÇÃO GOOGLE ---
        const syncGoogle = new SyncGoogleCalendarService();
        syncGoogle.execute(agendamento.id).catch(err => {
            console.error("Erro assíncrono na sincronização Google:", err);
        });

        return agendamento;
    }
}
