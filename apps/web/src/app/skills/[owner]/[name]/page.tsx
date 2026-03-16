import { getDb } from "@/lib/db";
import { skills, repos, users } from "@skillshub/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Star, Download } from "lucide-react";
import { stripFrontmatter } from "@/lib/utils";

interface Props {
  params: Promise<{ owner: string; name: string }>;
}

export default async function OldSkillDetailPage({ params }: Props) {
  const { owner, name } = await params;
  const db = getDb();

  // Look up the skill
  const [skill] = await db
    .select({
      id: skills.id,
      slug: skills.slug,
      name: skills.name,
      description: skills.description,
      readme: skills.readme,
      manifest: skills.manifest,
      tags: skills.tags,
      isPublished: skills.isPublished,
      createdAt: skills.createdAt,
      updatedAt: skills.updatedAt,
      repo: {
        starCount: repos.starCount,
        downloadCount: repos.downloadCount,
        githubOwner: repos.githubOwner,
        githubRepoName: repos.githubRepoName,
      },
      owner: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        isVerified: users.isVerified,
      },
    })
    .from(skills)
    .innerJoin(repos, eq(skills.repoId, repos.id))
    .innerJoin(users, eq(skills.ownerId, users.id))
    .where(and(eq(users.username, owner), eq(skills.slug, name)))
    .limit(1);

  if (!skill) notFound();

  // If skill has GitHub info, redirect to the GitHub-style route
  if (skill.repo.githubOwner && skill.repo.githubRepoName) {
    redirect(`/${skill.repo.githubOwner}/${skill.repo.githubRepoName}/${skill.slug}`);
  }

  // Render detail page for non-GitHub skills
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-6 font-mono text-xs text-neutral-600">
        <Link href="/" className="hover:text-neon-cyan transition-colors">
          ~
        </Link>
        <span className="mx-1 text-neutral-700">/</span>
        <span className="text-neutral-300">{owner}</span>
        <span className="mx-1 text-neutral-700">/</span>
        <span className="text-neutral-300">{skill.name}</span>
      </nav>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {skill.owner.avatarUrl && (
            <img
              src={skill.owner.avatarUrl}
              alt={skill.owner.username}
              className="h-8 w-8 rounded-full ring-1 ring-neutral-800"
            />
          )}
          <h1 className="font-mono text-2xl font-bold text-neutral-100">
            {skill.name}
          </h1>
        </div>
        {skill.description && (
          <p className="text-neutral-400 mb-4">{skill.description}</p>
        )}
        <div className="flex items-center gap-4 font-mono text-xs text-neutral-600">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" /> {skill.repo.starCount}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" /> {skill.repo.downloadCount}
          </span>
          <span>by {skill.owner.displayName ?? skill.owner.username}</span>
        </div>
      </div>

      {skill.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {skill.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {skill.readme && (
        <div className="prose prose-invert max-w-none rounded-lg border border-neutral-800 p-6">
          <pre className="whitespace-pre-wrap text-sm text-neutral-300">{stripFrontmatter(skill.readme)}</pre>
        </div>
      )}
    </div>
  );
}
