import crypto from "crypto";

function safeEqualString(a: string, b: string): boolean {
  const A = Buffer.from(a, "utf8");
  const B = Buffer.from(b, "utf8");
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

export type VerifyAbacatePaySignatureInput = {
  rawBody: Buffer;
  signature: string;
  secret: string;
};

export function verifyAbacatePaySignature({
  rawBody,
  signature,
  secret,
}: VerifyAbacatePaySignatureInput): boolean {
  const hmac = crypto.createHmac("sha256", secret).update(rawBody);
  const expectedBase64 = hmac.digest("base64");
  const expectedHex = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  return safeEqualString(signature, expectedBase64) || safeEqualString(signature, expectedHex);
}

