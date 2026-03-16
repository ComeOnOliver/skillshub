import { getDb } from "@/lib/db";
import { skills, repos, users } from "@skillshub/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SkillCard } from "@/components/skill-card";
import { DonateButton } from "@/components/donate-button";
import Link from "next/link";
import { getRepoStars } from "@/lib/ungh";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function RepoPage({ params }: Props) {
  const { owner, repo } = await params;
  const db = getDb();

  // Get repo info
  const [repoData] = await db
    .select({
      id: repos.id,
      name: repos.name,
      displayName: repos.displayName,
      description: repos.description,
      githubRepoUrl: repos.githubRepoUrl,
      githubOwner: repos.githubOwner,
      githubRepoName: repos.githubRepoName,
      starCount: repos.starCount,
      downloadCount: repos.downloadCount,
      owner: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        bscAddress: users.bscAddress,
      },
    })
    .from(repos)
    .innerJoin(users, eq(repos.ownerId, users.id))
    .where(
      and(
        eq(repos.githubOwner, owner),
        eq(repos.githubRepoName, repo)
      )
    )
    .limit(1);

  if (!repoData) notFound();

  // Only fetch GitHub stars if the repo owner matches the GitHub repo owner
  // (prevents imported repos from showing someone else's star count)
  const isOriginalOwner = repoData.owner.username === repoData.githubOwner;
  const githubStars = isOriginalOwner
    ? await getRepoStars(repoData.githubOwner ?? owner, repoData.githubRepoName ?? repo)
    : 0;

  // Get skills in this repo
  const data = await db
    .select({
      id: skills.id,
      slug: skills.slug,
      name: skills.name,
      description: skills.description,
      tags: skills.tags,
    })
    .from(skills)
    .where(
      and(
        eq(skills.repoId, repoData.id),
        eq(skills.isPublished, true)
      )
    )
    .orderBy(skills.name);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="mb-6 font-mono text-xs text-neutral-600">
        <Link href="/" className="hover:text-neon-cyan transition-colors">
          ~
        </Link>
        <span className="mx-1 text-neutral-700">/</span>
        <Link
          href={`/${owner}`}
          className="hover:text-neon-cyan transition-colors"
        >
          {owner}
        </Link>
        <span className="mx-1 text-neutral-700">/</span>
        <span className="text-neutral-300">{repo}</span>
      </nav>

      {/* Repo header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          {repoData.owner.avatarUrl && (
            <img
              src={repoData.owner.avatarUrl}
              alt={owner}
              className="h-8 w-8 rounded-full ring-1 ring-neutral-800"
            />
          )}
          <h1 className="font-mono text-2xl font-bold text-neutral-100">
            <span className="text-neon-cyan/40">&gt;</span>{" "}
            <span className="text-neutral-500">{owner}/</span>{repo}
          </h1>
        </div>
        <div className="mt-2 flex items-center gap-4 font-mono text-xs text-neutral-600">
          <span>📦 {data.length} skill{data.length !== 1 ? "s" : ""}</span>
          <span>❤️ {repoData.starCount} likes</span>
          {githubStars > 0 && (
            <span>⭐ {githubStars >= 1000 ? `${(githubStars / 1000).toFixed(1)}k` : githubStars} github stars</span>
          )}
          <span>📥 {repoData.downloadCount.toLocaleString()} downloads</span>
          {repoData.githubRepoUrl && (
            <a
              href={repoData.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neon-cyan transition-colors"
            >
              github →
            </a>
          )}
        </div>
        <div className="mt-3">
          <DonateButton
            authorBscAddress={repoData.owner.bscAddress}
            authorName={repoData.owner.username}
            repoId={repoData.id}
            toUserId={repoData.owner.id}
          />
        </div>
      </div>

      {/* Skills grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {data.map((skill) => (
          <SkillCard
            key={skill.id}
            id={skill.id}
            slug={skill.slug}
            name={skill.name}
            description={skill.description}
            tags={skill.tags}
            repo={{
              starCount: repoData.starCount,
              downloadCount: repoData.downloadCount,
              githubOwner: repoData.githubOwner,
              githubRepoName: repoData.githubRepoName,
            }}
            owner={repoData.owner}
          />
        ))}
      </div>
    </div>
  );
}
