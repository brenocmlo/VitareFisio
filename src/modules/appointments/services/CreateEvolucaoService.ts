import { AppDataSource } from "../../../data-source";
import { Evolucao } from "../entities/Evolucao";
import { Agendamento } from "../entities/Agendamento";

interface IRequest {
    agendamento_id: number;
    paciente_id: number;
    descricao: string;
    procedimentos?: string;
}

export class CreateEvolucaoService {
    async execute({ agendamento_id, paciente_id, descricao, procedimentos }: IRequest) {
        const evolucaoRepository = AppDataSource.getRepository(Evolucao);
        const agendamentoRepository = AppDataSource.getRepository(Agendamento);

        // 1. Criar a evolução
        const evolucao = evolucaoRepository.create({
            agendamento_id,
            paciente_id,
            descricao,
            procedimentos
        });

        await evolucaoRepository.save(evolucao);

        // 2. Mágica da Automação: Atualizar o agendamento para 'realizado'
        await agendamentoRepository.update(agendamento_id, {
            status: "realizado"
        });

        return evolucao;
    }
}