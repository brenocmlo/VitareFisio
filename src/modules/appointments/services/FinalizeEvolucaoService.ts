import crypto from "crypto";
import { AppDataSource } from "../../../data-source";
import { Evolucao } from "../entities/Evolucao";

export class FinalizeEvolucaoService {
    async execute(evolucao_id: number) {
        const repo = AppDataSource.getRepository(Evolucao);
        
        // Busca a evolução pelo ID
        const evolucao = await repo.findOneBy({ id: evolucao_id });

        if (!evolucao) {
            throw new Error("Evolução não encontrada.");
        }
        
        if (evolucao.finalizada) {
            throw new Error("Esta evolução já está assinada e congelada.");
        }

        const conteudoClinico = [
            evolucao.subjetivo,
            evolucao.objetivo,
            evolucao.avaliacao,
            evolucao.plano,
            evolucao.cid_10,
            evolucao.diagnostico_fisioterapeutico,
            evolucao.objetivos_tratamento,
        ]
            .filter(Boolean)
            .join("|");

        const dadosParaHash = `
            ID:${evolucao.id}|
            Paciente:${evolucao.paciente_id}|
            Conteudo:${conteudoClinico}|
            Data:${evolucao.data_criacao.toISOString()}
        `;

        const hash = crypto.createHash("sha256").update(dadosParaHash).digest("hex");

        evolucao.finalizada = true;
        evolucao.hash_integridade = hash;
        evolucao.data_finalizacao = new Date();

        await repo.save(evolucao);

        return evolucao;
    }
}
