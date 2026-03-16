import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { donations, users, repos } from "@skillshub/db/schema";
import { eq, desc } from "drizzle-orm";
import { DollarSign, ArrowDownLeft, Wallet, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function EarningsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const db = getDb();

  const [userData, recentDonations] = await Promise.all([
    db
      .select({
        bscAddress: users.bscAddress,
        totalDonationsReceived: users.totalDonationsReceived,
      })
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1),
    db
      .select({
        id: donations.id,
        amount: donations.amount,
        token: donations.token,
        txHash: donations.txHash,
        status: donations.status,
        createdAt: donations.createdAt,
        repoName: repos.name,
      })
      .from(donations)
      .leftJoin(repos, eq(donations.repoId, repos.id))
      .where(eq(donations.toUserId, user.userId))
      .orderBy(desc(donations.createdAt))
      .limit(20),
  ]);

  const totalReceived = userData[0]?.totalDonationsReceived ?? "0";
  const bscAddress = userData[0]?.bscAddress;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      <h1 className="mb-6 font-mono text-2xl font-bold text-neutral-100">
        <span className="text-neon-cyan/40">&gt;</span> earnings
      </h1>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="rounded border border-neutral-800/60 bg-[#0a0a0a] p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-neon-lime" />
            <div>
              <p className="text-3xl font-bold text-neutral-100">
                ${totalReceived}
              </p>
              <p className="font-mono text-xs text-neutral-500">
                total donations received
              </p>
            </div>
          </div>
        </div>

        <div className="rounded border border-neutral-800/60 bg-[#0a0a0a] p-6">
          <div className="flex items-center gap-3">
            <Wallet className="h-6 w-6 text-neon-cyan" />
            <div>
              {bscAddress ? (
                <>
                  <p className="break-all font-mono text-sm text-neon-cyan/80">
                    {bscAddress}
                  </p>
                  <p className="font-mono text-xs text-neutral-500">
                    BSC receiving address
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono text-sm text-neutral-400">
                    no address configured
                  </p>
                  <Link
                    href="/dashboard/wallet"
                    className="font-mono text-xs text-neon-cyan hover:underline"
                  >
                    set up wallet →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 font-mono text-lg font-semibold text-neutral-200">
          <ArrowDownLeft className="h-5 w-5 text-neon-lime" />
          donations received
        </h2>
        {recentDonations.length === 0 ? (
          <p className="font-mono text-sm text-neutral-500">
            no donations yet.
          </p>
        ) : (
          <div className="space-y-2">
            {recentDonations.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded border border-neutral-800/60 bg-[#0a0a0a] p-4"
              >
                <div>
                  <p className="font-mono font-medium text-neutral-200">
                    +{d.amount} {d.token}
                  </p>
                  <p className="font-mono text-xs text-neutral-500">
                    {d.repoName ?? "unknown repo"} ·{" "}
                    {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {d.txHash && (
                    <a
                      href={`https://bscscan.com/tx/${d.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-600 hover:text-neon-cyan transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                      d.status === "confirmed"
                        ? "bg-neon-lime/10 text-neon-lime"
                        : d.status === "failed"
                          ? "bg-red-900/20 text-red-400"
                          : "bg-yellow-900/30 text-yellow-300"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
