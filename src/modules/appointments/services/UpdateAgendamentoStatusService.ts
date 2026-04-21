import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Pagamento } from "../../finance/entities/Pagamento";
import { PacotePaciente } from "../../patients/entities/PacotePaciente";

interface IRequest {
    agendamento_id: number;
    status: string;
}

export class UpdateAgendamentoStatusService {
    async execute({ agendamento_id, status }: IRequest): Promise<Agendamento> {
        const agendamentoRepo = AppDataSource.getRepository(Agendamento);
        const pagamentoRepo = AppDataSource.getRepository(Pagamento);
        const pacoteRepo = AppDataSource.getRepository(PacotePaciente);

        const agendamento = await agendamentoRepo.findOne({
            where: { id: agendamento_id }
        });

        if (!agendamento) throw new Error("Agendamento não encontrado.");

        const allowedStatuses = ["agendado", "confirmado", "realizado", "faltou", "cancelado"];
        if (!allowedStatuses.includes(status)) {
            throw new Error(`Status inválido. Permitidos: ${allowedStatuses.join(", ")}`);
        }

        agendamento.status = status;
        await agendamentoRepo.save(agendamento);

        // =====================================================
        // REGRA DE NEGÓCIO: Ao marcar como "realizado",
        // verificar se o paciente tem pacote ativo (CRÉDITO)
        // ou gerar cobrança avulsa (DÉBITO).
        // =====================================================
        if (status === "realizado") {
            // Evita duplicar cobrança caso o status seja alterado duas vezes
            const jaFaturado = await pagamentoRepo.findOneBy({ agendamento_id });
            if (jaFaturado) return agendamento;

            // Busca o pacote ativo mais antigo com sessões disponíveis
            const pacoteAtivo = await pacoteRepo.findOne({
                where: {
                    paciente_id: agendamento.paciente_id,
                    clinica_id: agendamento.clinica_id,
                    status_pagamento: "pago"
                },
                order: { data_compra: "ASC" }
            });

            if (pacoteAtivo && pacoteAtivo.sessoes_restantes > 0) {
                // ✅ CRÉDITO: desconta 1 sessão do pacote
                pacoteAtivo.sessoes_restantes -= 1;
                await pacoteRepo.save(pacoteAtivo);
            } else {
                // 💳 DÉBITO AVULSO: cria cobrança pendente
                const pagamento = pagamentoRepo.create({
                    paciente_id: agendamento.paciente_id,
                    agendamento_id: agendamento.id,
                    clinica_id: agendamento.clinica_id,
                    valor: 150.00, // TODO: substituir pelo valor configurável da clínica (P3)
                    forma_pagamento: "pix",
                    status: "pendente",
                    data_pagamento: new Date()
                });
                await pagamentoRepo.save(pagamento);
            }
        }

        return agendamento;
    }
}
