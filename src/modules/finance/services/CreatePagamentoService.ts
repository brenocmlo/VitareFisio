import { AppDataSource } from "../../../data-source";
import { Pagamento } from "../entities/Pagamento";

interface IRequest {
    paciente_id: number;
    agendamento_id?: number;
    valor: number;
    data_vencimento: Date;
}

export class CreatePagamentoService {
    async execute({ paciente_id, agendamento_id, valor, data_vencimento }: IRequest) {
        const pagamentoRepository = AppDataSource.getRepository(Pagamento);

        const pagamento = pagamentoRepository.create({
            paciente_id,
            agendamento_id,
            valor,
            data_vencimento,
            status: "pendente"
        });

        await pagamentoRepository.save(pagamento);
        return pagamento;
    }
}