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
        const allowedStatuses = ["agendado", "confirmado", "realizado", "faltou", "cancelado"];
        if (!allowedStatuses.includes(status)) {
            throw new Error(`Status inválido. Permitidos: ${allowedStatuses.join(", ")}`);
        }

        // =====================================================
        // DATABASE TRANSACTION: Garante que ou tudo salva, ou nada salva.
        // Previne que o agendamento seja atualizado sem descontar a sessão.
        // =====================================================
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const agendamento = await transactionalEntityManager.findOne(Agendamento, {
                where: { id: agendamento_id }
            });

            if (!agendamento) throw new Error("Agendamento não encontrado.");

            // Salva o status anterior para sabermos se realmente mudou para "realizado" agora
            const statusAnterior = agendamento.status;
            
            agendamento.status = status;
            await transactionalEntityManager.save(agendamento);

            // =====================================================
            // REGRA DE NEGÓCIO: DÉBITO DE SESSÕES OU COBRANÇA AVULSA
            // =====================================================
            
            // CASO A: Mudou PARA "realizado" (Consumir sessão)
            if (status === "realizado" && statusAnterior !== "realizado") {
                
                // 1. Verifica se já foi faturado como avulso antes
                const jaFaturadoAvulso = await transactionalEntityManager.findOne(Pagamento, {
                    where: { agendamento_id: agendamento.id }
                });

                if (!jaFaturadoAvulso && !agendamento.pacote_paciente_id) {
                    // Busca o pacote ativo mais antigo com sessões disponíveis
                    const pacoteAtivo = await transactionalEntityManager.findOne(PacotePaciente, {
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
                        await transactionalEntityManager.save(pacoteAtivo);
                        
                        // Vincula o agendamento ao pacote para rastreabilidade
                        agendamento.pacote_paciente_id = pacoteAtivo.id;
                        await transactionalEntityManager.save(agendamento);

                    } else {
                        // 💳 DÉBITO AVULSO: cria cobrança pendente
                        const pagamento = transactionalEntityManager.create(Pagamento, {
                            paciente_id: agendamento.paciente_id,
                            agendamento_id: agendamento.id,
                            clinica_id: agendamento.clinica_id,
                            valor: 150.00, // TODO: substituir pelo valor configurável da clínica
                            metodo_pagamento: "pix",
                            status: "pendente",
                            data_pagamento: new Date()
                        });
                        await transactionalEntityManager.save(pagamento);
                    }
                }
            }
            
            // CASO B: Mudou DE "realizado" PARA OUTRO (Estornar sessão)
            else if (statusAnterior === "realizado" && status !== "realizado") {
                // Se foi usado um pacote, devolve a sessão
                if (agendamento.pacote_paciente_id) {
                    const pacote = await transactionalEntityManager.findOne(PacotePaciente, {
                        where: { id: agendamento.pacote_paciente_id }
                    });

                    if (pacote) {
                        pacote.sessoes_restantes += 1;
                        await transactionalEntityManager.save(pacote);
                    }

                    // Remove o vínculo do pacote no agendamento
                    agendamento.pacote_paciente_id = null as any;
                    await transactionalEntityManager.save(agendamento);
                } 
                // Se foi gerado um pagamento avulso pendente, removemos
                else {
                    const pagamentoPendente = await transactionalEntityManager.findOne(Pagamento, {
                        where: { 
                            agendamento_id: agendamento.id,
                            status: "pendente" 
                        }
                    });

                    if (pagamentoPendente) {
                        await transactionalEntityManager.remove(pagamentoPendente);
                    }
                }
            }

            return agendamento;
        });
    }
}