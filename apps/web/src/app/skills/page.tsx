import { getDb } from "@/lib/db";
import { skills, repos, users } from "@skillshub/db/schema";
import { eq, desc, and, sql, arrayContains } from "drizzle-orm";
import { SkillCard } from "@/components/skill-card";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ q?: string; tags?: string; sort?: string; page?: string }>;
}

async function SkillsList({ searchParams }: Props) {
  const params = await searchParams;
  const db = getDb();
  const page = Number(params.page ?? 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(skills.isPublished, true)];

  if (params.q) {
    conditions.push(
      sql`(${skills.name} ILIKE ${`%${params.q}%`} OR ${skills.description} ILIKE ${`%${params.q}%`})`
    );
  }

  if (params.tags) {
    const tagList = params.tags.split(",").filter(Boolean);
    if (tagList.length > 0) {
      conditions.push(arrayContains(skills.tags, tagList));
    }
  }

  const sort = params.sort ?? "stars";
  const orderBy =
    sort === "downloads"
      ? desc(repos.downloadCount)
      : sort === "recent"
        ? desc(skills.createdAt)
        : desc(repos.starCount);

  const where = and(...conditions);

  const [data, countResult] = await Promise.all([
    db
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
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(skills)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  if (data.length === 0) {
    return (
      <div className="py-16 text-center font-mono text-sm text-neutral-600">
        {params.q ? (
          <>
            <span className="text-neon-cyan/40">$</span> search &quot;{params.q}&quot;<br />
            <span className="text-neutral-500 mt-1 block">// 0 results — try different keywords</span>
          </>
        ) : (
          <>
            <span className="text-neon-cyan/40">$</span> ls registry/<br />
            <span className="text-neutral-500 mt-1 block">// empty — no skills published yet</span>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 font-mono text-xs text-neutral-600">
        <span className="text-neon-lime/50">found</span> {total} skill{total !== 1 ? "s" : ""} in registry
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {data.map((skill) => (
          <SkillCard key={skill.id} {...skill} />
        ))}
      </div>
      {offset + limit < total && (
        <div className="mt-8 text-center">
          <a
            href={`/skills?${new URLSearchParams({
              ...(params.q ? { q: params.q } : {}),
              ...(params.tags ? { tags: params.tags } : {}),
              ...(params.sort ? { sort: params.sort } : {}),
              page: String(page + 1),
            }).toString()}`}
            className="inline-block rounded border border-neutral-800/50 px-5 py-2 font-mono text-xs text-neutral-500 hover:border-neon-cyan/30 hover:text-neon-cyan transition-all"
          >
            load --more
          </a>
        </div>
      )}
    </>
  );
}

export default function SkillsPage(props: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-mono text-lg text-neutral-300">
          <span className="text-neon-cyan/50">&gt;</span> browse<span className="text-neutral-600">/</span>registry
        </h1>
        <div className="flex gap-1.5">
          {["stars", "downloads", "recent"].map((s) => (
            <a
              key={s}
              href={`/skills?sort=${s}`}
              className="rounded border border-neutral-800/40 px-3 py-1 font-mono text-[10px] text-neutral-500 hover:border-neon-cyan/30 hover:text-neon-cyan transition-all"
            >
              --{s}
            </a>
          ))}
        </div>
      </div>
      <Suspense
        fallback={
          <div className="py-16 text-center font-mono text-xs text-neutral-600">
            <span className="text-neon-cyan/40">$</span> loading registry<span className="cursor-blink text-neon-cyan ml-0.5">▋</span>
          </div>
        }
      >
        <SkillsList searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
