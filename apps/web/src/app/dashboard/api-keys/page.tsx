import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { apiKeys } from "@skillshub/db/schema";
import { eq, desc } from "drizzle-orm";
import { CreateApiKeyForm } from "./create-form";
import { KeyItem } from "./key-item";

export default async function ApiKeysPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const db = getDb();
  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      revokedAt: apiKeys.revokedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, user.userId))
    .orderBy(desc(apiKeys.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Keys</h1>
      </div>

      <div className="mb-8">
        <CreateApiKeyForm />
      </div>

      {keys.length === 0 ? (
        <p className="text-sm text-neutral-500">No API keys created yet.</p>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <KeyItem key={key.id} item={key} />
          ))}
        </div>
      )}
    </div>
  );
}
