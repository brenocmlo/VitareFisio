import { Request, Response } from "express";
import { GetDashboardSummaryService } from "../services/GetDashboardSummaryService";

export class DashboardController {
    async index(req: Request, res: Response) {
        try {
            // Pegamos a clinica_id do usuário que logou (isso vem do Token!)
            const { clinica_id } = req.user!;

            const dashboardService = new GetDashboardSummaryService();
            const summary = await dashboardService.execute(Number(clinica_id));

            return res.json(summary);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}