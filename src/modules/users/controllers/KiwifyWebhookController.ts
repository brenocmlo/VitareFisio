import { Request, Response } from "express";
import { verifyKiwifySignature } from "../../../shared/utils/verifyKiwifySignature";
import { IKiwifyWebhook } from "../dtos/IKiwifyWebhook";
import { ProcessKiwifyWebhookService } from "../services/ProcessKiwifyWebhookService";

export class KiwifyWebhookController {
  private processService = new ProcessKiwifyWebhookService();

  handle = async (req: Request, res: Response): Promise<Response> => {
    const secret = process.env.KIWIFY_WEBHOOK_TOKEN;
    if (!secret) {
      return res.status(500).json({ error: "KIWIFY_WEBHOOK_TOKEN não configurado." });
    }

    const signature = req.header("X-Kiwify-Signature") as string | undefined;

    if (!signature) {
      return res.status(401).json({ error: "Assinatura ausente." });
    }

    const rawBody = req.body as Buffer;
    if (!Buffer.isBuffer(rawBody)) {
      return res.status(400).json({ error: "Body raw não disponível para validação." });
    }

    // A Kiwify valida a assinatura enviando o payload da forma como foi recebido
    const signatureOk = verifyKiwifySignature({ rawBody, signature, secret });
    if (!signatureOk) {
      // Para debug local: podemos comentar o return temporariamente ou ignorar em dev
      if (process.env.NODE_ENV === "production") {
        return res.status(401).json({ error: "Assinatura inválida." });
      } else {
        console.warn("[Kiwify] Assinatura inválida (ignorado em dev)");
      }
    }

    let payload: IKiwifyWebhook;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({ error: "JSON inválido." });
    }

    // Responde com sucesso rapidamente
    res.status(200).send("OK");

    // Processa de forma assíncrona
    setImmediate(() => {
      this.processService.execute(payload).catch((err) => {
        console.error("[Kiwify] Erro ao processar webhook:", err);
      });
    });

    return res;
  };
}
