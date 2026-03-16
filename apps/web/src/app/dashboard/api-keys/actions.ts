"use server";

import { getUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { apiKeys } from "@skillshub/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "node:crypto";
import { revalidatePath } from "next/cache";

function generateApiKey(): string {
  const bytes = crypto.randomBytes(32);
  return "skh_" + bytes.toString("base64url");
}

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function createApiKey(name: string) {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 64) {
    throw new Error("Name must be 1-64 characters");
  }

  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = rawKey.slice(0, 12) + "...";

  const db = getDb();
  await db.insert(apiKeys).values({
    userId: user.userId,
    name: trimmed,
    keyHash,
    keyPrefix,
  });

  revalidatePath("/dashboard/api-keys");

  return { key: rawKey };
}

export async function revokeApiKey(keyId: string) {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  const db = getDb();
  const [key] = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, user.userId)))
    .limit(1);

  if (!key) throw new Error("API key not found");

  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(eq(apiKeys.id, keyId));

  revalidatePath("/dashboard/api-keys");
}

export async function renameApiKey(keyId: string, name: string) {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 64) {
    throw new Error("Name must be 1-64 characters");
  }

  const db = getDb();
  const [key] = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, user.userId)))
    .limit(1);

  if (!key) throw new Error("API key not found");

  await db
    .update(apiKeys)
    .set({ name: trimmed })
    .where(eq(apiKeys.id, keyId));

  revalidatePath("/dashboard/api-keys");
}
