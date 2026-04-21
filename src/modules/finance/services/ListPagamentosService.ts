import { AppDataSource } from "../../../data-source";
import { Pagamento } from "../entities/Pagamento";

export class ListPagamentosService {
    async execute(clinica_id: number) {
        const repo = AppDataSource.getRepository(Pagamento);

        // Buscamos os pagamentos com a relação do paciente
        const pagamentos = await repo.find({
            where: { clinica_id },
            relations: ["paciente"],
            order: { created_at: "DESC" }
        });

        // REUTILIZAÇÃO: Calculamos os totais aqui para o dashboard
        const totalRecebido = pagamentos
            .filter(p => p.status === "pago")
            .reduce((acc, p) => acc + Number(p.valor), 0);

        const aReceber = pagamentos
            .filter(p => p.status === "pendente" || p.status === "atrasado")
            .reduce((acc, p) => acc + Number(p.valor), 0);

        return {
            stats: {
                totalRecebido,
                aReceber,
                faturamentoMes: totalRecebido + aReceber
            },
            recentes: pagamentos // A lista que já existia
        };
    }
}