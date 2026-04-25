import { AppDataSource } from "../../../data-source";
import { Agendamento } from "../entities/Agendamento";
import { Pagamento } from "../../finance/entities/Pagamento";
import { PacotePaciente } from "../../patients/entities/PacotePaciente";
import { SyncGoogleCalendarService } from "./SyncGoogleCalendarService";

interface IRequest {
    agendamento_id: number;
}

export class CancelAgendamentoService {
    async execute({ agendamento_id }: IRequest): Promise<Agendamento> {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            
            const agendamento = await transactionalEntityManager.findOne(Agendamento, {
                where: { id: agendamento_id }
            });

            if (!agendamento) {
                throw new Error("Agendamento não encontrado.");
            }

            if (agendamento.status === "cancelado") {
                throw new Error("Este agendamento já está cancelado.");
            }

            const statusAnterior = agendamento.status;
            
            // 1. Atualiza o status para cancelado
            agendamento.status = "cancelado";
            await transactionalEntityManager.save(agendamento);

            // =====================================================
            // REGRA DE NEGÓCIO (ESTORNO):
            // Se o status anterior era "realizado", significa que o 
            // sistema já cobrou ou descontou uma sessão. Precisamos desfazer.
            // =====================================================
            if (statusAnterior === "realizado") {
                
                // Verifica se gerou cobrança avulsa
                const pagamentoVinculado = await transactionalEntityManager.findOne(Pagamento, {
                    where: { agendamento_id: agendamento.id }
                });

                if (pagamentoVinculado) {
                    if (pagamentoVinculado.status === "pago") {
                        // Trava de segurança: não mexe num pagamento que já entrou no caixa.
                        throw new Error("Não é possível cancelar uma consulta que já foi paga. Cancele o pagamento no financeiro primeiro.");
                    } else {
                        // Se estava pendente, deletamos a cobrança para não sujar o caixa
                        await transactionalEntityManager.remove(pagamentoVinculado);
                    }
                } else {
                    // Se NÃO tem pagamento vinculado, significa que usou um pacote (crédito)
                    // Vamos devolver a sessão para o pacote ativo do paciente
                    const pacoteAtivo = await transactionalEntityManager.findOne(PacotePaciente, {
                        where: {
                            paciente_id: agendamento.paciente_id,
                            clinica_id: agendamento.clinica_id
                        },
                        order: { data_compra: "DESC" } // Pega o pacote mais recente para devolver
                    });

                    if (pacoteAtivo) {
                        pacoteAtivo.sessoes_restantes += 1;
                        await transactionalEntityManager.save(pacoteAtivo);
                    }
                }
            }

            await transactionalEntityManager.save(agendamento);

            // --- SINCRONIZAÇÃO GOOGLE ---
            const syncGoogle = new SyncGoogleCalendarService();
            syncGoogle.delete(agendamento.id).catch(err => {
                console.error("Erro assíncrono ao deletar do Google:", err);
            });

            return agendamento;
        });
    }
}