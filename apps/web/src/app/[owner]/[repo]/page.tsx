export const dynamic = "force-dynamic";
import { getDb } from "@/lib/db";
import { skills, repos, users } from "@skillshub/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SkillCard } from "@/components/skill-card";
import { DonateButton } from "@/components/donate-button";
import { CopyButton } from "@/components/copy-button";
import Link from "next/link";
import Image from "next/image";
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

  const firstSkillSlug = data.length > 0 ? data[0].slug : "skill-name";
  const installCommand = `npx skills add ${owner}/${repo} --skill ${firstSkillSlug}`;

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

      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          {repoData.owner.avatarUrl && (
            <Image
              src={repoData.owner.avatarUrl}
              alt={owner}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full ring-2 ring-neutral-800"
            />
          )}
          <div className="flex-1">
            <h1 className="font-mono text-3xl font-extrabold tracking-tight text-neutral-100">
              <span className="text-neon-cyan/40">&gt;</span>{" "}
              <span className="text-neutral-500">{owner}/</span>
              <span className="text-neutral-50">{repo}</span>
            </h1>
            {repoData.description && (
              <p className="mt-2 font-mono text-sm text-neutral-400 max-w-2xl">
                {repoData.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats cluster */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/50 px-2.5 py-1 font-mono text-xs text-neutral-400">
            <span>📦</span> {data.length} skill{data.length !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/50 px-2.5 py-1 font-mono text-xs text-neutral-400">
            <span>❤️</span> {repoData.starCount} likes
          </span>
          {githubStars > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/50 px-2.5 py-1 font-mono text-xs text-neutral-400">
              <span>⭐</span> {githubStars >= 1000 ? `${(githubStars / 1000).toFixed(1)}k` : githubStars} stars
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/50 px-2.5 py-1 font-mono text-xs text-neutral-400">
            <span>📥</span> {repoData.downloadCount.toLocaleString()} downloads
          </span>
          {repoData.githubRepoUrl && (
            <a
              href={repoData.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/50 px-2.5 py-1 font-mono text-xs text-neutral-400 transition-colors hover:border-neon-cyan/50 hover:text-neon-cyan"
            >
              github →
            </a>
          )}
          <DonateButton
            authorBscAddress={repoData.owner.bscAddress}
            authorName={repoData.owner.username}
            repoId={repoData.id}
            toUserId={repoData.owner.id}
          />
        </div>
      </div>

      {/* Quick Install Bar */}
      <div className="mb-8 flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3">
        <span className="font-mono text-sm text-neon-cyan/60 select-none">$</span>
        <code className="flex-1 font-mono text-sm text-neutral-300 overflow-x-auto">
          {installCommand}
        </code>
        <CopyButton text={installCommand} />
      </div>

      {/* About Section */}
      {repoData.description && (
        <div className="mb-8">
          <h2 className="mb-3 font-mono text-sm font-semibold text-neutral-500">
            <span className="text-neon-cyan/50">&gt;</span> about
          </h2>
          <div className="rounded border border-neutral-800/50 bg-neutral-900/20 p-4">
            <p className="font-mono text-sm leading-relaxed text-neutral-300">
              {repoData.description}
            </p>
          </div>
        </div>
      )}

      {/* Skills Grid */}
      <div className="mb-8">
        <h2 className="mb-4 font-mono text-sm font-semibold text-neutral-500">
          <span className="text-neon-cyan/50">&gt;</span> skills ({data.length})
        </h2>
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
    </div>
  );
}
