import { AppDataSource } from "../../../data-source";
import { Evolucao } from "../entities/Evolucao";
import { Paciente } from "../../patients/entities/Paciente";

interface IRequest {
    id: number;
    subjetivo?: string;
    objetivo?: string;
    avaliacao?: string;
    plano?: string;
    cid_10?: string;
    diagnostico_fisioterapeutico?: string;
    objetivos_tratamento?: string;
    usuario_id: number; // 🔒 RLS
}

export class UpdateEvolucaoService {
    async execute(data: IRequest) {
        const evolucaoRepo = AppDataSource.getRepository(Evolucao);

        const evolucao = await evolucaoRepo.findOneBy({ id: data.id });

        if (!evolucao) {
            throw new Error("Evolução não encontrada.");
        }

        const pacienteRepo = AppDataSource.getRepository(Paciente);
        const paciente = await pacienteRepo.findOneBy({ id: evolucao.paciente_id });
        
        if (!paciente || paciente.usuario_id !== data.usuario_id) {
            throw new Error("Acesso negado: Você não tem permissão para alterar os registros deste paciente (LGPD).");
        }

        // Trava de Segurança: Evolução assinada digitalmente não pode ser alterada!
        if (evolucao.finalizada) {
            throw new Error("Evolução já foi finalizada e não pode ser editada. Crie uma nova evolução de retificação se necessário.");
        }

        // Atualiza apenas os campos enviados
        evolucao.subjetivo = data.subjetivo ?? evolucao.subjetivo;
        evolucao.objetivo = data.objetivo ?? evolucao.objetivo;
        evolucao.avaliacao = data.avaliacao ?? evolucao.avaliacao;
        evolucao.plano = data.plano ?? evolucao.plano;
        evolucao.cid_10 = data.cid_10 ?? evolucao.cid_10;
        evolucao.diagnostico_fisioterapeutico = data.diagnostico_fisioterapeutico ?? evolucao.diagnostico_fisioterapeutico;
        evolucao.objetivos_tratamento = data.objetivos_tratamento ?? evolucao.objetivos_tratamento;

        await evolucaoRepo.save(evolucao);

        return evolucao;
    }
}