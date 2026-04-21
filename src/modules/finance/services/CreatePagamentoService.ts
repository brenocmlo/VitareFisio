import { AppDataSource } from "../../../data-source";
import { Pagamento } from "../entities/Pagamento";
import { PacotePaciente } from "../../patients/entities/PacotePaciente";
import { Paciente } from "../../patients/entities/Paciente";
import { Agendamento } from "../../appointments/entities/Agendamento";
import { addDays } from "date-fns";

interface IRequest {
    paciente_id: number;
    clinica_id: number;
    agendamento_id?: number;
    valor: number;
    forma_pagamento: string; // recebido do frontend/schema como forma_pagamento
    status?: "pago" | "pendente" | "atrasado";
    data_pagamento?: string;
    // Campos para ativação de Pacote de Sessões
    is_pacote?: boolean;
    quantidade_sessoes?: number;
}

export class CreatePagamentoService {
    async execute({
        paciente_id,
        clinica_id,
        agendamento_id,
        valor,
        forma_pagamento,
        status = "pago",
        data_pagamento,
        is_pacote = false,
        quantidade_sessoes = 1
    }: IRequest) {
        const pagamentoRepo = AppDataSource.getRepository(Pagamento);
        const pacoteRepo = AppDataSource.getRepository(PacotePaciente);
        const pacienteRepo = AppDataSource.getRepository(Paciente);

        // Validação: paciente existe e pertence à clínica
        const paciente = await pacienteRepo.findOneBy({ id: paciente_id });
        if (!paciente) throw new Error("Paciente não encontrado.");

        // Validação: agendamento existe (se informado)
        if (agendamento_id) {
            const agendamentoRepo = AppDataSource.getRepository(Agendamento);
            const agendamento = await agendamentoRepo.findOneBy({ id: agendamento_id });
            if (!agendamento) throw new Error("Agendamento não encontrado.");
        }

        // 1. Sempre registra o pagamento financeiro
        // forma_pagamento → metodo_pagamento para compatibilidade com a entidade Pagamento
        const pagamento = pagamentoRepo.create({
            paciente_id,
            clinica_id,
            agendamento_id,
            valor,
            metodo_pagamento: forma_pagamento as any,
            status,
            data_pagamento: data_pagamento ? new Date(data_pagamento) : new Date()
        });

        await pagamentoRepo.save(pagamento);

        // 2. Se for um Pacote, cria o registro na tabela pacotes_pacientes
        if (is_pacote && quantidade_sessoes > 0) {
            const pacote = pacoteRepo.create({
                paciente_id,
                clinica_id,
                sessoes_total: quantidade_sessoes,
                sessoes_restantes: quantidade_sessoes,
                data_validade: addDays(new Date(), 90), // Validade padrão: 90 dias
                status_pagamento: status === "pago" ? "pago" : "pendente"
            });

            await pacoteRepo.save(pacote);
        }

        return pagamento;
    }
}
