import { AppDataSource } from "../../../data-source";
import { Pagamento } from "../entities/Pagamento";
import { PacotePaciente } from "../../patients/entities/PacotePaciente";
import { addDays } from "date-fns";

export class CreateAgendamentoService {
    async execute(data: any) {
        const repo = AppDataSource.getRepository(Agendamentos);

        // Converte a string "YYYY-MM-DD HH:mm:00" para o objeto Date do JavaScript
        const dataConvertida = new Date(data.data_hora);

        // Trava de segurança: Verifica se a data é válida
        if (isNaN(dataConvertida.getTime())) {
            throw new Error("Formato de data inválido recebido no servidor.");
        }

        const agendamento = repo.create({
            paciente_id: data.paciente_id,
            fisioterapeuta_id: data.fisioterapeuta_id,
            clinica_id: data.clinica_id,
            data_hora: dataConvertida, // Salva o objeto Date
            observacoes: data.observacoes,
            status: 'agendado'
        });

        await repo.save(agendamento);
        return agendamento;
    }
}