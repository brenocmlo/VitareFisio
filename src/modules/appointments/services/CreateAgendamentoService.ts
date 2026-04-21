import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Paciente } from "../../patients/entities/Paciente";
import { Not } from "typeorm"; // Não esqueça de importar o Not

export class CreateAgendamentoService {
    async execute({ paciente_id, clinica_id, fisioterapeuta_id, data_hora, observacoes }: IRequest): Promise<Agendamento> {
        const agendamentoRepository = AppDataSource.getRepository(Agendamento);
        const pacienteRepository = AppDataSource.getRepository(Paciente);

        const paciente = await pacienteRepository.findOneBy({ id: paciente_id });
        if (!paciente) {
            throw new Error("Paciente não encontrado.");
        }

        // 1. Normaliza a data para evitar erros de milissegundos
        const dataInicio = new Date(data_hora);
        dataInicio.setSeconds(0);
        dataInicio.setMilliseconds(0);
        
        const dataFim = new Date(dataInicio.getTime() + 60 * 60 * 1000); 

        // 2. BUSCA DE CONFLITO (Ajustada para ser exata)
        const conflito = await agendamentoRepository.findOne({
            where: {
                data_hora: dataInicio,
                fisioterapeuta_id: Number(fisioterapeuta_id), // Filtra pelo seu ID
                status: Not("cancelado") // Só dá conflito se NÃO estiver cancelado
            }
        });

        if (conflito) {
            // Se cair aqui, o erro vai para o Frontend e o agendamento NÃO é criado
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

        return agendamento;
    }
}