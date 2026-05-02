import { Request, Response } from "express";
import { verifyAbacatePaySignature } from "../../../shared/utils/verifyAbacatePaySignature";
import { IAbacatePayWebhook } from "../dtos/IAbacatePayWebhook";
import { ProcessAbacatePayWebhookService } from "../services/ProcessAbacatePayWebhookService";

export class AbacatePayWebhookController {
  private processService = new ProcessAbacatePayWebhookService();

  handle = async (req: Request, res: Response): Promise<Response> => {
    const secret = process.env.ABACATEPAY_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "ABACATEPAY_WEBHOOK_SECRET não configurado." });
    }

    const signature =
      (req.header("abacate-signature") as string | undefined) ??
      (req.header("x-webhook-signature") as string | undefined) ??
      (req.header("X-Webhook-Signature") as string | undefined);

    if (!signature) {
      return res.status(401).json({ error: "Assinatura ausente." });
    }

    const rawBody = req.body as Buffer;
    if (!Buffer.isBuffer(rawBody)) {
      return res.status(400).json({ error: "Body raw não disponível para validação." });
    }

    const signatureOk = verifyAbacatePaySignature({ rawBody, signature, secret });
    if (!signatureOk) {
      return res.status(401).json({ error: "Assinatura inválida." });
    }

    let payload: IAbacatePayWebhook;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({ error: "JSON inválido." });
    }

    res.status(200).send("OK");

    setImmediate(() => {
      this.processService.execute(payload).catch((err) => {
        console.error("[ABACATEPAY] Erro ao processar webhook:", err);
      });
    });

    return res;
  };
}

