import { getUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { skills, repos } from "@skillshub/db/schema";
import { eq, and } from "drizzle-orm";
import { SkillEditForm } from "./edit-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSkillPage({ params }: Props) {
  const user = await getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const db = getDb();

  const [skill] = await db
    .select({
      id: skills.id,
      slug: skills.slug,
      name: skills.name,
      description: skills.description,
      readme: skills.readme,
      tags: skills.tags,
      ownerId: skills.ownerId,
      repoGithubOwner: repos.githubOwner,
      repoGithubRepoName: repos.githubRepoName,
    })
    .from(skills)
    .innerJoin(repos, eq(skills.repoId, repos.id))
    .where(and(eq(skills.id, id), eq(skills.ownerId, user.userId)))
    .limit(1);

  if (!skill) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-mono text-xl font-bold text-neutral-100">
          <span className="text-neon-cyan/60">$</span> edit{" "}
          <span className="text-neutral-400">{skill.name}</span>
        </h1>
        <p className="mt-1 font-mono text-xs text-neutral-600">
          /{skill.repoGithubOwner}/{skill.repoGithubRepoName}/{skill.slug}
        </p>
      </div>
      <SkillEditForm
        skill={{
          id: skill.id,
          name: skill.name,
          slug: skill.slug,
          description: skill.description ?? "",
          readme: skill.readme ?? "",
          tags: skill.tags,
          githubOwner: skill.repoGithubOwner,
          githubRepoName: skill.repoGithubRepoName,
        }}
      />
    </div>
  );
}
