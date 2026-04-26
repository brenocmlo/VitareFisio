import { Request, Response } from "express";
import { HandleKiwifyWebhookService } from "../services/HandleKiwifyWebhookService";

export class KiwifyController {
  async handle(req: Request, res: Response) {
    try {
      const payload = req.body;
      const signature = req.headers['x-kiwify-signature'] as string;

      const handleKiwifyWebhook = new HandleKiwifyWebhookService();
      
      const result = await handleKiwifyWebhook.execute(payload, signature);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Erro no Webhook Kiwify:", error.message);
      // Retornamos 200 para a Kiwify não ficar tentando reenviar em caso de erro de lógica de negócio,
      // mas registramos o erro internamente.
      return res.status(200).json({ error: error.message });
    }
  }
}
