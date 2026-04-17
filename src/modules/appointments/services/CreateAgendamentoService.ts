import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Paciente } from "../../patients/entities/Paciente";

interface IRequest {
    paciente_id: number;
    clinica_id: number; 
    fisioterapeuta_id: number;
    data_hora: string; 
    observacoes?: string;
}

export class CreateAgendamentoService {
    async execute({ paciente_id, clinica_id, fisioterapeuta_id, data_hora, observacoes }: IRequest): Promise<Agendamento> {
        const agendamentoRepository = AppDataSource.getRepository(Agendamento);
        const pacienteRepository = AppDataSource.getRepository(Paciente);

        const paciente = await pacienteRepository.findOneBy({ id: paciente_id });
        if (!paciente) {
            throw new Error("Paciente não encontrado.");
        }

        // --- A MÁGICA ACONTECE AQUI ---
        // 1. Converte o texto recebido para Data (Início)
        const dataInicio = new Date(data_hora);
        
        // 2. Calcula automaticamente a Data de Fim (+ 1 hora)
        // 60 minutos * 60 segundos * 1000 milissegundos
        const dataFim = new Date(dataInicio.getTime() + 60 * 60 * 1000); 
        // ------------------------------

        const conflito = await agendamentoRepository.findOneBy({
            data_hora: dataInicio
        });

        if (conflito) {
            throw new Error("Este horário já está ocupado por outro paciente.");
        }

        const agendamento = agendamentoRepository.create({
            paciente_id,
            clinica_id,
            fisioterapeuta_id,
            data_hora: dataInicio,
            data_hora_fim: dataFim, // <-- ENVIAMOS A DATA CALCULADA AQUI
            observacoes,
            status: "agendado" 
        });

        await agendamentoRepository.save(agendamento);

        return agendamento;
    }
}