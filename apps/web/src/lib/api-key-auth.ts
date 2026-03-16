import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { apiKeys } from "@skillshub/db/schema";
import { eq } from "drizzle-orm";

export interface AuthResult {
  userId: string;
  apiKeyId: string;
}

export async function authenticateApiKey(
  request: Request
): Promise<AuthResult | Response> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer skh_")) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Missing or invalid API key" } },
      { status: 401 }
    );
  }

  const key = authHeader.slice(7); // Remove "Bearer "
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");

  const db = getDb();
  const [found] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (!found || found.revokedAt) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid or revoked API key" } },
      { status: 401 }
    );
  }

  // Update last used (fire-and-forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, found.id))
    .then(() => {});

  return { userId: found.userId, apiKeyId: found.id };
}

export function isAuthError(result: AuthResult | Response): result is Response {
  return result instanceof Response;
}
