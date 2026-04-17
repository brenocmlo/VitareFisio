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

        // Criamos uma string com os dados imutáveis para gerar o Hash
        const dadosParaHash = `
            ID:${evolucao.id}|
            Paciente:${evolucao.paciente_id}|
            Descricao:${evolucao.descricao}|
            Data:${evolucao.data_criacao.toISOString()}
        `;

        // Geramos o Hash SHA-256
        const hash = crypto.createHash("sha256").update(dadosParaHash).digest("hex");

        // Atualizamos os campos com os nomes EXATOS da Entity
        evolucao.finalizada = true;
        evolucao.hash_integridade = hash;
        evolucao.data_finalizacao = new Date(); // Usando 'ç' aqui!

        await repo.save(evolucao);

        return evolucao;
    }
}