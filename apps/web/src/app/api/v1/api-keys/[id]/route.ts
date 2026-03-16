import { getDb } from "@/lib/db";
import { corsJson, OPTIONS as corsOptions } from "@/lib/api-cors";
import { authenticateApiKey, isAuthError } from "@/lib/api-key-auth";
import { apiKeys } from "@skillshub/db/schema";
import { eq, and } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiKey(request);
  if (isAuthError(auth)) return auth;

  const { id: keyId } = await params;
  if (!UUID_RE.test(keyId)) {
    return corsJson(
      { error: { code: "NOT_FOUND", message: "API key not found" } },
      { status: 404 }
    );
  }

  const db = getDb();

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, auth.userId)))
    .limit(1);

  if (!key) {
    return corsJson(
      { error: { code: "NOT_FOUND", message: "API key not found" } },
      { status: 404 }
    );
  }

  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(eq(apiKeys.id, keyId));

  return corsJson({ data: { id: keyId, revoked: true } });
}

export { corsOptions as OPTIONS };
