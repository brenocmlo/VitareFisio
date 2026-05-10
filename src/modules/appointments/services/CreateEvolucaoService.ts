import { AppDataSource } from "../../../data-source";
import { Evolucao } from "../entities/Evolucao";
import { Agendamento } from "../entities/Agendamento";
import { Paciente } from "../../patients/entities/Paciente";

interface IRequest {
    agendamento_id: number;
    paciente_id: number;
    subjetivo?: string;
    objetivo?: string;
    avaliacao?: string;
    plano?: string;
    cid_10?: string;
    diagnostico_fisioterapeutico?: string;
    objetivos_tratamento?: string;
    usuario_id: number; // 🔒 RLS
}

export class CreateEvolucaoService {
    async execute(data: IRequest) {
        const evolucaoRepo = AppDataSource.getRepository(Evolucao);
        const agendamentoRepo = AppDataSource.getRepository(Agendamento);
        const pacienteRepo = AppDataSource.getRepository(Paciente);

        const paciente = await pacienteRepo.findOneBy({ id: data.paciente_id });
        if (!paciente || paciente.usuario_id !== data.usuario_id) {
            throw new Error("Acesso negado: Você não tem permissão para alterar os registros deste paciente (LGPD).");
        }

        const agendamento = await agendamentoRepo.findOneBy({ id: data.agendamento_id });
        if (!agendamento) {
            throw new Error("Agendamento não encontrado.");
        }

        const evolucaoExistente = await evolucaoRepo.findOneBy({ agendamento_id: data.agendamento_id });
        if (evolucaoExistente) {
            throw new Error("Já existe um prontuário registado para esta consulta.");
        }

        const evolucao = evolucaoRepo.create({
            agendamento_id: data.agendamento_id,
            paciente_id: data.paciente_id,
            subjetivo: data.subjetivo,
            objetivo: data.objetivo,
            avaliacao: data.avaliacao,
            plano: data.plano,
            cid_10: data.cid_10,
            diagnostico_fisioterapeutico: data.diagnostico_fisioterapeutico,
            objetivos_tratamento: data.objetivos_tratamento,
            finalizada: false
        });

        await evolucaoRepo.save(evolucao);

        return evolucao;
    }
}
