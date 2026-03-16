import { Hono } from "hono";
import { createDb } from "@skillshub/db/client";
import { donations, repos, users } from "@skillshub/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { apiKeyAuth } from "../middleware/auth.js";

export const donationsRouter = new Hono();

const recordDonationSchema = z.object({
  toUserId: z.string().uuid(),
  repoId: z.string().uuid(),
  authorTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  platformTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  amount: z.coerce.number().positive(),
  token: z.enum(["USDT", "USDC"]),
});

// POST /api/v1/donations/record — record a completed on-chain donation
donationsRouter.post("/donations/record", async (c) => {
  const body = await c.req.json();
  const parsed = recordDonationSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      400
    );
  }

  const db = createDb();

  // Verify the recipient user exists
  const [recipient] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, parsed.data.toUserId))
    .limit(1);

  if (!recipient) {
    return c.json(
      { error: { code: "NOT_FOUND", message: "Recipient user not found" } },
      404
    );
  }

  // Record donation and increment totalDonationsReceived atomically
  const [donation] = await db.transaction(async (tx) => {
    const [d] = await tx
      .insert(donations)
      .values({
        fromUserId: null,
        toUserId: parsed.data.toUserId,
        repoId: parsed.data.repoId,
        amount: String(parsed.data.amount),
        token: parsed.data.token,
        chain: "bsc",
        txHash: parsed.data.authorTxHash,
        status: "confirmed",
      })
      .returning();

    await tx
      .update(users)
      .set({
        totalDonationsReceived: sql`${users.totalDonationsReceived}::numeric + ${String(parsed.data.amount)}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, parsed.data.toUserId));

    return [d];
  });

  return c.json(
    {
      data: {
        donationId: donation.id,
        txHash: donation.txHash,
        amount: parsed.data.amount,
        token: parsed.data.token,
        status: "confirmed",
      },
    },
    201
  );
});

// GET /api/v1/donations — list donations for authenticated user
donationsRouter.get("/donations", apiKeyAuth, async (c) => {
  const userId = c.get("userId");
  const db = createDb();

  const userDonations = await db
    .select({
      id: donations.id,
      amount: donations.amount,
      token: donations.token,
      chain: donations.chain,
      txHash: donations.txHash,
      status: donations.status,
      createdAt: donations.createdAt,
      repoName: repos.name,
    })
    .from(donations)
    .leftJoin(repos, eq(donations.repoId, repos.id))
    .where(eq(donations.toUserId, userId))
    .orderBy(desc(donations.createdAt))
    .limit(50);

  return c.json({ data: userDonations });
});
