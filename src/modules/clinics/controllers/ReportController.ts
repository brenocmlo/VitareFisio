import { Request, Response } from "express";
import { GenerateProntuarioPDFService } from "../../appointments/services/GenerateProntuarioPDFService";

export class ReportController {
    async exportProntuario(req: Request, res: Response) {
        try {
            const { paciente_id } = req.params;
            const generatePDF = new GenerateProntuarioPDFService();
            
            const pdfBuffer = await generatePDF.execute(Number(paciente_id));

            // Configuramos o cabeçalho para o navegador entender que é um PDF
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=prontuario_${paciente_id}.pdf`);

            return res.send(pdfBuffer);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}
