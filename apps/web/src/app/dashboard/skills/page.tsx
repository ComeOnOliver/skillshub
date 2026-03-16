import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { skills, repos } from "@skillshub/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Plus, Star, Download, Pencil } from "lucide-react";

export default async function MySkillsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const db = getDb();
  const mySkills = await db
    .select({
      id: skills.id,
      slug: skills.slug,
      name: skills.name,
      description: skills.description,
      tags: skills.tags,
      isPublished: skills.isPublished,
      createdAt: skills.createdAt,
      repoGithubOwner: repos.githubOwner,
      repoGithubRepoName: repos.githubRepoName,
      repoStarCount: repos.starCount,
      repoDownloadCount: repos.downloadCount,
    })
    .from(skills)
    .innerJoin(repos, eq(skills.repoId, repos.id))
    .where(eq(skills.ownerId, user.userId))
    .orderBy(desc(skills.createdAt));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Skills</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/skills/import"
            className="inline-flex items-center gap-2 rounded-md border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-2 font-mono text-sm text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
          >
            ⇣ Import
          </Link>
          <Link
            href="/skills/publish"
            className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            Publish
          </Link>
        </div>
      </div>

      {mySkills.length === 0 ? (
        <div className="rounded-lg border border-neutral-800 p-16 text-center">
          <p className="mb-4 text-neutral-400">
            You haven't published any skills yet.
          </p>
          <Link
            href="/skills/publish"
            className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-6 py-3 text-sm text-white hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            Publish your first skill
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {mySkills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between rounded-lg border border-neutral-800 p-5"
            >
              <div>
                <Link
                  href={skill.repoGithubOwner && skill.repoGithubRepoName ? `/${skill.repoGithubOwner}/${skill.repoGithubRepoName}/${skill.slug}` : `/skills/${user.username}/${skill.slug}`}
                  className="font-semibold hover:underline"
                >
                  {skill.name}
                </Link>
                {skill.description && (
                  <p className="mt-1 text-sm text-neutral-400 line-clamp-1">
                    {skill.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-4 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" /> {skill.repoStarCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" /> {skill.repoDownloadCount}
                  </span>
                  <span>
                    {skill.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {skill.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
                <Link
                  href={`/dashboard/skills/${skill.id}/edit`}
                  className="ml-2 flex h-7 w-7 items-center justify-center rounded-md border border-neutral-700 text-neutral-500 hover:border-neon-cyan/50 hover:text-neon-cyan transition-colors"
                  title="Edit skill"
                >
                  <Pencil className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
