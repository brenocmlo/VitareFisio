import { AppDataSource } from "../../../data-source";
import { Pagamento } from "../entities/Pagamento";

export class ListPagamentosService {
    async execute(): Promise<Pagamento[]> {
        const pagamentoRepository = AppDataSource.getRepository(Pagamento);
        // Trazendo a relação de paciente para exibir o nome na tela de financeiro
        const pagamentos = await pagamentoRepository.find({
            relations: ["paciente"],
            order: { data_pagamento: "DESC" }
        });
        return pagamentos;
    }
}
