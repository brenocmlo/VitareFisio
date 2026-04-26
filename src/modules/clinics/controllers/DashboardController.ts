import { Request, Response } from "express";
import { GetDashboardMetricsService } from "../services/GetDashboardMetricsService";
import { cache } from "../../../shared/utils/cache";

export class DashboardController {
    /**
     * @method getMetrics
     * Este método extrai o clinica_id da URL e solicita ao serviço
     * o cálculo de pacientes, agendamentos do dia e faturamento mensal.
     */
    async getMetrics(req: Request, res: Response) {
        try {
            // Capturamos o ID da clínica via Query Params (Ex: /dashboard?clinica_id=1)
            const { clinica_id } = req.query;

            if (!clinica_id) {
                return res.status(400).json({ 
                    error: "O ID da clínica (ou workspace do autónomo) é obrigatório para carregar o dashboard." 
                });
            }

            const cacheKey = `dashboard_metrics_${clinica_id}`;
            const cachedMetrics = cache.get(cacheKey);

            if (cachedMetrics) {
                return res.status(200).json(cachedMetrics);
            }

            const getDashboardMetrics = new GetDashboardMetricsService();
            
            // Executamos o serviço que consolidámos anteriormente
            const metrics = await getDashboardMetrics.execute(Number(clinica_id));

            // Salva no cache por 2 minutos (120 segundos)
            cache.set(cacheKey, metrics, 120);

            return res.status(200).json(metrics);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}