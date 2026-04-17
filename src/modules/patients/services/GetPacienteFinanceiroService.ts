import { AppDataSource } from "../../../data-source";
import { Paciente } from "../entities/Paciente";
import { Agendamento } from "../../appointments/entities/Agendamento";
import { Pagamento } from "../../finance/entities/Pagamento";

export class GetPacienteFinanceiroService {
    async execute(paciente_id: number) {
        const pacienteRepository = AppDataSource.getRepository(Paciente);
        const agendamentoRepository = AppDataSource.getRepository(Agendamento);
        const pagamentoRepository = AppDataSource.getRepository(Pagamento);

        const paciente = await pacienteRepository.findOneBy({ id: paciente_id });
        if (!paciente) throw new Error("Paciente não encontrado.");

        // 1. Calcular total de sessões realizadas
        const sessoesRealizadas = await agendamentoRepository.countBy({
            paciente_id,
            status: "realizado"
        });

        const totalDevido = sessoesRealizadas * Number(paciente.valor_sessao);

        // 2. Calcular total já pago
        const pagamentos = await pagamentoRepository.findBy({ paciente_id, status: "pago" });
        const totalPago = pagamentos.reduce((acc, pag) => acc + Number(pag.valor), 0);

        return {
            paciente: paciente.nome,
            valor_sessao: paciente.valor_sessao,
            sessoes_realizadas: sessoesRealizadas,
            total_devido: totalDevido,
            total_pago: totalPago,
            saldo: totalPago - totalDevido // Positivo = Crédito, Negativo = Débito
        };
    }
}