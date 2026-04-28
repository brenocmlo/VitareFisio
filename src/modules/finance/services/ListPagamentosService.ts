import { AppDataSource } from "../../../data-source";
import { Pagamento } from "../entities/Pagamento";

export class ListPagamentosService {
    async execute(clinica_id: number, mes?: number, ano?: number) {
        const repo = AppDataSource.getRepository(Pagamento);

        const query = repo.createQueryBuilder("pagamento")
            .leftJoinAndSelect("pagamento.paciente", "paciente")
            .where("pagamento.clinica_id = :clinica_id", { clinica_id })
            .orderBy("pagamento.created_at", "DESC");

        // Se passar mês e ano, filtramos no banco
        if (mes && ano) {
            // No PostgreSQL/TypeORM usamos EXTRACT ou comparamos strings formatadas
            // Para ser compatível com SQLite (dev) e Postgres (prod), podemos usar raw SQL ou bounds
            const startDate = new Date(ano, mes - 1, 1);
            const endDate = new Date(ano, mes, 0, 23, 59, 59);
            
            query.andWhere("pagamento.created_at BETWEEN :startDate AND :endDate", { 
                startDate, 
                endDate 
            });
        }

        const pagamentos = await query.getMany();

        // Cálculo de estatísticas otimizado (em uma única query ou via QueryBuilder sum)
        const statsQuery = repo.createQueryBuilder("pagamento")
            .select("SUM(CASE WHEN pagamento.status = 'pago' THEN pagamento.valor ELSE 0 END)", "totalRecebido")
            .addSelect("SUM(CASE WHEN pagamento.status IN ('pendente', 'atrasado') THEN pagamento.valor ELSE 0 END)", "aReceber")
            .where("pagamento.clinica_id = :clinica_id", { clinica_id });

        if (mes && ano) {
            const startDate = new Date(ano, mes - 1, 1);
            const endDate = new Date(ano, mes, 0, 23, 59, 59);
            statsQuery.andWhere("pagamento.created_at BETWEEN :startDate AND :endDate", { startDate, endDate });
        }

        const statsResult = await statsQuery.getRawOne();

        return {
            stats: {
                totalRecebido: Number(statsResult.totalRecebido || 0),
                aReceber: Number(statsResult.aReceber || 0),
                faturamentoMes: Number(statsResult.totalRecebido || 0) + Number(statsResult.aReceber || 0)
            },
            recentes: pagamentos
        };
    }
}