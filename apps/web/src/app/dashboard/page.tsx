import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { skills, repos, donations, users } from "@skillshub/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import Link from "next/link";
import { Key, Package, DollarSign, LogOut, Wallet } from "lucide-react";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const db = getDb();

  const [userDataArr, skillCount, donationStats, recentSkills] = await Promise.all([
    db
      .select({
        bscAddress: users.bscAddress,
        totalDonationsReceived: users.totalDonationsReceived,
      })
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(skills)
      .where(eq(skills.ownerId, user.userId)),
    db
      .select({
        total: sql<string>`COALESCE(SUM(${donations.amount}::numeric), 0)::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(donations)
      .where(eq(donations.toUserId, user.userId)),
    db
      .select({
        id: skills.id,
        slug: skills.slug,
        name: skills.name,
        repoId: skills.repoId,
        repoGithubOwner: repos.githubOwner,
        repoGithubRepoName: repos.githubRepoName,
        repoStarCount: repos.starCount,
        repoDownloadCount: repos.downloadCount,
      })
      .from(skills)
      .innerJoin(repos, eq(skills.repoId, repos.id))
      .where(eq(skills.ownerId, user.userId))
      .orderBy(desc(skills.createdAt))
      .limit(5),
  ]);

  const userData = userDataArr[0];
  const hasBscAddress = !!userData?.bscAddress;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user.displayName ?? user.username}
          </h1>
          <p className="text-neutral-400">@{user.username}</p>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-md border border-neutral-800 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-900"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-800 p-6">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{skillCount[0]?.count ?? 0}</p>
              <p className="text-sm text-neutral-400">Published Skills</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-neutral-800 p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                ${userData?.totalDonationsReceived ?? "0"}
              </p>
              <p className="text-sm text-neutral-400">Total Donations</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-neutral-800 p-6">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">
                {donationStats[0]?.count ?? 0}
              </p>
              <p className="text-sm text-neutral-400">Donations Received</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-neutral-800 p-6">
          <div className="flex items-center gap-3">
            <Wallet className={`h-5 w-5 ${hasBscAddress ? "text-cyan-500" : "text-yellow-600"}`} />
            <div>
              <p className="text-2xl font-bold">
                {hasBscAddress ? "✓" : "—"}
              </p>
              <p className="text-sm text-neutral-400">
                {hasBscAddress ? (
                  "Wallet Set Up"
                ) : (
                  <Link href="/dashboard/wallet" className="text-cyan-500 hover:underline">
                    Set Up Wallet →
                  </Link>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Skills</h2>
            <div className="flex items-center gap-3">
              <Link
                href="/skills/import"
                className="text-sm text-neon-cyan hover:underline font-mono"
              >
                ⇣ import
              </Link>
              <Link
                href="/skills/publish"
                className="text-sm text-blue-600 hover:underline"
              >
                + publish
              </Link>
            </div>
          </div>
          {recentSkills.length === 0 ? (
            <p className="text-sm text-neutral-400">
              No skills published yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSkills.map((s) => (
                <Link
                  key={s.id}
                  href={s.repoGithubOwner && s.repoGithubRepoName ? `/${s.repoGithubOwner}/${s.repoGithubRepoName}/${s.slug}` : `/skills/${user.username}/${s.slug}`}
                  className="block rounded-lg border border-neutral-800 p-4 hover:bg-neutral-900"
                >
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-neutral-400">
                    {s.repoStarCount} stars · {s.repoDownloadCount} downloads
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Quick Links</h2>
          <div className="space-y-2">
            <Link
              href="/skills/import"
              className="block rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 p-4 hover:bg-neon-cyan/10 transition-colors"
            >
              <p className="font-medium font-mono text-neon-cyan">⇣ Import from GitHub</p>
              <p className="text-sm text-neutral-400">
                Scan a repo and import skills with one click
              </p>
            </Link>
            <Link
              href="/dashboard/skills"
              className="block rounded-lg border border-neutral-800 p-4 hover:bg-neutral-900"
            >
              <p className="font-medium">My Skills</p>
              <p className="text-sm text-neutral-400">
                Manage your published skills
              </p>
            </Link>
            <Link
              href="/dashboard/wallet"
              className="block rounded-lg border border-neutral-800 p-4 hover:bg-neutral-900"
            >
              <p className="font-medium">Wallet Setup</p>
              <p className="text-sm text-neutral-400">
                Configure your BSC receiving address
              </p>
            </Link>
            <Link
              href="/dashboard/earnings"
              className="block rounded-lg border border-neutral-800 p-4 hover:bg-neutral-900"
            >
              <p className="font-medium">Earnings</p>
              <p className="text-sm text-neutral-400">
                View donation history
              </p>
            </Link>
            <Link
              href="/dashboard/api-keys"
              className="block rounded-lg border border-neutral-800 p-4 hover:bg-neutral-900"
            >
              <p className="font-medium">API Keys</p>
              <p className="text-sm text-neutral-400">
                Manage your API access
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
