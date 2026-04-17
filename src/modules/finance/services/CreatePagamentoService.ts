import { AppDataSource } from "../../../data-source";
import { Pagamento } from "../entities/Pagamento";
import { Paciente } from "../../patients/entities/Paciente";
import { Agendamento } from "../../appointments/entities/Agendamento";

interface IRequest {
    paciente_id: number;
    clinica_id: number;
    agendamento_id?: number;
    valor: number;
    forma_pagamento: "pix" | "cartao_credito" | "cartao_debito" | "dinheiro" | "convenio";
    status?: "pendente" | "pago" | "cancelado" | "estornado";
    data_pagamento?: string;
}

export class CreatePagamentoService {
    async execute({ paciente_id, clinica_id, agendamento_id, valor, forma_pagamento, status = "pago", data_pagamento }: IRequest) {
        const pagamentoRepo = AppDataSource.getRepository(Pagamento);
        const pacienteRepo = AppDataSource.getRepository(Paciente);
        
        // 1. Validação básica
        const paciente = await pacienteRepo.findOneBy({ id: paciente_id });
        if (!paciente) {
            throw new Error("Paciente não encontrado.");
        }

        // 2. Se informou agendamento, verifica se ele existe
        if (agendamento_id) {
            const agendamentoRepo = AppDataSource.getRepository(Agendamento);
            const agendamento = await agendamentoRepo.findOneBy({ id: agendamento_id });
            if (!agendamento) {
                throw new Error("Agendamento não encontrado.");
            }
        }

        // 3. Criação do registro financeiro
        const pagamento = pagamentoRepo.create({
            paciente_id,
            clinica_id,
            agendamento_id,
            valor,
            forma_pagamento,
            status,
            data_pagamento: data_pagamento ? new Date(data_pagamento) : new Date()
        });

        await pagamentoRepo.save(pagamento);

        return pagamento;
    }
}