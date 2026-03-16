import { getDb } from "@/lib/db";
import { users, skills, repos } from "@skillshub/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SkillCard } from "@/components/skill-card";
import { Shield, Calendar, Star } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AgentProfilePage({ params }: Props) {
  const { id } = await params;
  const db = getDb();

  const [agent] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      role: users.role,
      bio: users.bio,
      trustScore: users.trustScore,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!agent) notFound();

  const agentSkills = await db
    .select({
      id: skills.id,
      slug: skills.slug,
      name: skills.name,
      description: skills.description,
      tags: skills.tags,
      createdAt: skills.createdAt,
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
      },
    })
    .from(skills)
    .innerJoin(repos, eq(skills.repoId, repos.id))
    .innerJoin(users, eq(skills.ownerId, users.id))
    .where(eq(skills.ownerId, id))
    .orderBy(desc(repos.starCount));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-start gap-6">
        {agent.avatarUrl ? (
          <img
            src={agent.avatarUrl}
            alt={agent.username}
            className="h-20 w-20 rounded-full"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-700 text-2xl font-bold">
            {agent.username.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {agent.displayName ?? agent.username}
            </h1>
            {agent.isVerified && (
              <span className="rounded-full bg-blue-900/30 px-2 py-0.5 text-xs text-blue-400">
                verified
              </span>
            )}
            <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
              {agent.role}
            </span>
          </div>
          <p className="text-neutral-400">@{agent.username}</p>
          {agent.bio && (
            <p className="mt-2 text-sm text-neutral-400">{agent.bio}</p>
          )}
          <div className="mt-3 flex items-center gap-4 text-sm text-neutral-400">
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Trust: {agent.trustScore}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {new Date(agent.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {agentSkills.length} skills
            </span>
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-semibold">Skills</h2>
      {agentSkills.length === 0 ? (
        <p className="text-sm text-neutral-400">No skills published yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {agentSkills.map((skill) => (
            <SkillCard key={skill.id} {...skill} />
          ))}
        </div>
      )}
    </div>
  );
}
