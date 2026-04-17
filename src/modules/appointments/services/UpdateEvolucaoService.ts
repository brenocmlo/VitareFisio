import { AppDataSource } from "../../../data-source";
import { Evolucao } from "../entities/Evolucao";

interface IRequest {
    id: number;
    descricao: string;
    procedimentos?: string;
}

export class UpdateEvolucaoService {
    async execute({ id, descricao, procedimentos }: IRequest) {
        const repo = AppDataSource.getRepository(Evolucao);
        const evolucao = await repo.findOneBy({ id });

        if (!evolucao) {
            throw new Error("Evolução não encontrada.");
        }

        // --- TRAVA DE SEGURANÇA JURÍDICA ---
        if (evolucao.finalizada) {
            throw new Error("Esta evolução já foi assinada e não pode mais ser editada.");
        }

        const agora = new Date().getTime();
        const dataCriacao = evolucao.data_criacao.getTime();
        const diffHoras = (agora - dataCriacao) / (1000 * 60 * 60);

        if (diffHoras > 24) {
            throw new Error("O prazo de 24 horas para edição desta evolução expirou.");
        }
        // -----------------------------------

        evolucao.descricao = descricao;
        if (procedimentos) evolucao.procedimentos = procedimentos;

        await repo.save(evolucao);

        return evolucao;
    }
}