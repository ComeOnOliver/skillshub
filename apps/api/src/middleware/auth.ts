import type { Context, Next } from "hono";
import { createDb } from "@skillshub/db/client";
import { apiKeys } from "@skillshub/db/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export async function apiKeyAuth(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer skh_")) {
    return c.json(
      { error: { code: "UNAUTHORIZED", message: "Missing or invalid API key" } },
      401
    );
  }

  const key = authHeader.slice(7); // Remove "Bearer "
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");

  const db = createDb();
  const [found] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (!found || found.revokedAt) {
    return c.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid or revoked API key" } },
      401
    );
  }

  // Update last used
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, found.id));

  c.set("userId", found.userId);
  c.set("apiKeyId", found.id);
  await next();
}
