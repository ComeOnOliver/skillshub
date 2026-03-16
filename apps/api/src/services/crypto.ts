import crypto from "node:crypto";

export function generateApiKey(): string {
  const bytes = crypto.randomBytes(32);
  return "skh_" + bytes.toString("base64url");
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}
