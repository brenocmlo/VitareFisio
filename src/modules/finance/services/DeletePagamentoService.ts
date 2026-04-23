import { AppDataSource } from "../../../data-source";
import { Pagamento } from "../entities/Pagamento";

interface DeletePagamentoRequest {
    id: number;
    clinica_id: number;
    user_id?: string;
}

export class DeletePagamentoService {
    async execute({ id, clinica_id, user_id }: DeletePagamentoRequest): Promise<{ id: number }> {
        const pagamentoRepository = AppDataSource.getRepository(Pagamento);

        // Validar se o pagamento existe e pertence à clínica
        const pagamento = await pagamentoRepository.findOneBy({
            id,
            clinica_id
        });

        if (!pagamento) {
            throw new Error("Lançamento não encontrado.");
        }

        // Deleta o pagamento diretamente. Como a linha inteira sumirá do banco de dados,
        // não é necessário alterar os dados (fazer save) antes de excluí-la.
        await pagamentoRepository.remove(pagamento);

        // Logging para auditoria
        const timestamp = new Date().toLocaleString("pt-BR");
        console.log(
            `[AUDITORIA] Pagamento ${id} removido por usuário ${user_id || "desconhecido"} em ${timestamp}`
        );

        return { id };
    }
}