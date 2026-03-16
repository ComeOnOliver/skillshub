import { Hono } from "hono";
import { createDb } from "@skillshub/db/client";
import { apiKeys } from "@skillshub/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { generateApiKey, hashApiKey } from "../services/crypto.js";
import { createApiKeySchema } from "@skillshub/shared/validators";
import { apiKeyAuth } from "../middleware/auth.js";

export const apiKeysRouter = new Hono();

apiKeysRouter.use("*", apiKeyAuth);

// GET /api/v1/api-keys — list API keys for current user
apiKeysRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const db = createDb();

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId));

  return c.json({ data: keys });
});

// POST /api/v1/api-keys — create a new API key
apiKeysRouter.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const parsed = createApiKeySchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      400
    );
  }

  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = rawKey.slice(0, 12) + "...";

  const db = createDb();
  const [created] = await db
    .insert(apiKeys)
    .values({
      userId,
      name: parsed.data.name,
      keyHash,
      keyPrefix,
    })
    .returning();

  return c.json(
    {
      data: {
        id: created.id,
        name: created.name,
        key: rawKey, // Only shown once
        keyPrefix,
        createdAt: created.createdAt,
      },
    },
    201
  );
});

// DELETE /api/v1/api-keys/:id — revoke an API key
apiKeysRouter.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const keyId = c.req.param("id");
  const db = createDb();

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)))
    .limit(1);

  if (!key) {
    return c.json(
      { error: { code: "NOT_FOUND", message: "API key not found" } },
      404
    );
  }

  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(eq(apiKeys.id, keyId));

  return c.json({ data: { id: keyId, revoked: true } });
});
