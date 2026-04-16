import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Paciente } from "../../patients/entities/Paciente";

interface IRequest {
    paciente_id: number;
    fisioterapeuta_id: number;
    data_hora: string; // Recebemos como string do JSON e convertemos
    observacoes?: string;
}

export class CreateAgendamentoService {
    async execute({ paciente_id, fisioterapeuta_id, data_hora, observacoes }: IRequest): Promise<Agendamento> {
        const agendamentoRepository = AppDataSource.getRepository(Agendamento);
        const pacienteRepository = AppDataSource.getRepository(Paciente);

        // 1. Validação: O paciente existe?
        const paciente = await pacienteRepository.findOneBy({ id: paciente_id });
        if (!paciente) {
            throw new Error("Paciente não encontrado.");
        }

        // 2. Validação de Conflito: Já existe alguém nesse horário?
        // Convertemos a string para um objeto Date do JavaScript
        const dataAgendamento = new Date(data_hora);

        const conflito = await agendamentoRepository.findOneBy({
            data_hora: dataAgendamento
        });

        if (conflito) {
            throw new Error("Este horário já está ocupado por outro paciente.");
        }

        // 3. Criação do registro
        const agendamento = agendamentoRepository.create({
            paciente_id,
            fisioterapeuta_id,
            data_hora: dataAgendamento,
            observacoes,
            status: "agendado" // Status inicial padrão
        });

        await agendamentoRepository.save(agendamento);

        return agendamento;
    }
}
