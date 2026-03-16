import { getDb } from "@/lib/db";
import { skills, repos, users } from "@skillshub/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMultiRepoStars } from "@/lib/ungh";

interface Props {
  params: Promise<{ owner: string }>;
}

export default async function OwnerPage({ params }: Props) {
  const { owner } = await params;
  const db = getDb();

  // Get owner info
  const [user] = await db
    .select({
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      isVerified: users.isVerified,
      bio: users.bio,
    })
    .from(users)
    .where(eq(users.username, owner))
    .limit(1);

  // Get repos with skill counts
  const repoList = await db
    .select({
      id: repos.id,
      name: repos.name,
      githubRepoName: repos.githubRepoName,
      githubRepoUrl: repos.githubRepoUrl,
      starCount: repos.starCount,
      downloadCount: repos.downloadCount,
      skillCount: sql<number>`(SELECT count(*)::int FROM skills WHERE skills.repo_id = ${repos.id})`,
    })
    .from(repos)
    .where(eq(repos.githubOwner, owner))
    .orderBy(desc(repos.starCount));

  if (repoList.length === 0) notFound();

  // Fetch GitHub stars live from Ungh (cached 1hr)
  const starsMap = await getMultiRepoStars(
    repoList
      .filter((r) => r.githubRepoName)
      .map((r) => ({ owner, repo: r.githubRepoName! }))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="mb-6 font-mono text-xs text-neutral-600">
        <Link href="/" className="hover:text-neon-cyan transition-colors">
          ~
        </Link>
        <span className="mx-1 text-neutral-700">/</span>
        <span className="text-neutral-300">{owner}</span>
      </nav>

      {/* Owner header */}
      <div className="mb-8 flex items-center gap-4">
        {user?.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={owner}
            className="h-12 w-12 rounded-full ring-1 ring-neutral-800"
          />
        )}
        <div>
          <h1 className="font-mono text-2xl font-bold text-neutral-100">
            <span className="text-neon-cyan/40">&gt;</span> {user?.displayName || owner}
          </h1>
          {user?.bio && (
            <p className="mt-1 text-sm text-neutral-500">{user.bio}</p>
          )}
          {user?.isVerified && (
            <span className="mt-1 inline-block font-mono text-[10px] text-neon-lime/60">
              ✓ verified
            </span>
          )}
        </div>
      </div>

      {/* Repo list */}
      <h2 className="mb-4 font-mono text-sm text-neutral-400">
        <span className="text-neon-cyan/50">&gt;</span> repositories{" "}
        <span className="text-neutral-600">({repoList.length})</span>
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {repoList.map((repo) => (
          <Link
            key={repo.id}
            href={`/${owner}/${repo.githubRepoName}`}
            className="group block rounded border border-neutral-800/50 bg-neutral-900/20 p-4 transition-all hover:border-neon-cyan/30 hover:bg-neutral-900/40 glow-box"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-mono text-sm font-medium text-neutral-200 group-hover:text-neon-cyan transition-colors">
                <span className="text-neutral-600 group-hover:text-neon-cyan/50">&gt;</span>{" "}
                {owner}/{repo.githubRepoName}
              </h3>
              <span className="font-mono text-[10px] text-neutral-600 shrink-0">
                ⭐ {((starsMap.get(`${owner}/${repo.githubRepoName}`) ?? 0) / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="mt-2 flex items-center gap-4 font-mono text-[10px] text-neutral-600">
              <span>{repo.skillCount} skill{repo.skillCount !== 1 ? "s" : ""}</span>
              <span>{repo.downloadCount.toLocaleString()} downloads</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
