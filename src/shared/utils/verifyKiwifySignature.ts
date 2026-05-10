import crypto from "crypto";

type VerifyKiwifySignatureInput = {
  rawBody: Buffer;
  signature: string;
  secret: string;
};

export function verifyKiwifySignature({ rawBody, signature, secret }: VerifyKiwifySignatureInput): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha1", secret)
      .update(rawBody.toString("utf8"))
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (err) {
    console.error("[Kiwify] Erro ao validar assinatura:", err);
    return false;
  }
}
