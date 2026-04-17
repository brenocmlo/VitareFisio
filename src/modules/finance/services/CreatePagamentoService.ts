import { AppDataSource } from "../../../data-source";
import { Pagamento } from "../entities/Pagamento";

interface IRequest {
    paciente_id: number;
    agendamento_id?: number;
    valor: number;
    forma_pagamento: string;
}

export class CreatePagamentoService {
    async execute({ paciente_id, agendamento_id, valor, forma_pagamento }: IRequest) {
        const pagamentoRepository = AppDataSource.getRepository(Pagamento);

        const pagamento = pagamentoRepository.create({
            paciente_id,
            agendamento_id,
            valor,
            forma_pagamento,
            status: 'pago' // Baixa manual assume recebimento imediato
        });

        await pagamentoRepository.save(pagamento);

        return pagamento;
    }
}