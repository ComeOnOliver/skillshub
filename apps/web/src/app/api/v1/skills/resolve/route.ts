import { getDb } from "@/lib/db";
import { corsJson, OPTIONS as corsOptions, formatZodError } from "@/lib/api-cors";
import { skills, repos, users } from "@skillshub/db/schema";
import { eq, sql, and, or } from "drizzle-orm";
import { z } from "zod";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://skillshub.wtf";

const STOPWORDS = new Set([
  "the", "a", "an", "is", "for", "with", "to", "and", "or", "in", "on", "of",
  "that", "this", "it", "my", "me", "i", "do", "how", "what", "help", "need",
  "want", "please", "can", "should",
]);

const resolveSchema = z.object({
  task: z.string().min(1).max(500),
  limit: z.coerce.number().int().min(1).max(5).default(1),
});

function tokenize(task: string): string[] {
  return task
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOPWORDS.has(w));
}

interface SkillRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  tags: string[];
  readmeLength: number;
  repo: {
    githubOwner: string | null;
    githubRepoName: string | null;
    starCount: number;
  };
  owner: {
    username: string;
    avatarUrl: string | null;
  };
}

function scoreSkill(skill: SkillRow, tokens: string[]): number {
  const nameLower = skill.name.toLowerCase();
  const nameParts = nameLower.split(/[-_\s]+/);
  const descLower = (skill.description ?? "").toLowerCase();
  const tagsLower = skill.tags.map((t) => t.toLowerCase());

  // TEXT RELEVANCE (0-60)
  let textScore = 0;
  let nameHits = 0;

  for (const token of tokens) {
    // Name matching — strongest signal
    if (nameLower === token) {
      textScore += 20; // exact full name match
      nameHits++;
    } else if (nameParts.includes(token)) {
      textScore += 15; // exact word in name (e.g. "terraform" in "terraform-skill")
      nameHits++;
    } else if (nameLower.includes(token)) {
      textScore += 8; // substring in name
      nameHits++;
    }

    // Description matching
    if (descLower.includes(token)) {
      textScore += 3;
    }

    // Tag matching — good signal
    if (tagsLower.includes(token)) {
      textScore += 6;
    }
  }

  // Bonus: if multiple tokens match the name, this skill is highly relevant
  if (nameHits >= 2) textScore += 10;

  textScore = Math.min(textScore, 60);

  // QUALITY (0-25)
  const readmeLen = Math.max(skill.readmeLength, 1);
  // log2(37) ≈ 5.2 → 0, log2(10000) ≈ 13.3 → ~10
  const readmeScore = Math.min(10, Math.max(0, (Math.log2(readmeLen) - 5.2) * (10 / (13.3 - 5.2))));
  const hasTagsScore = skill.tags.length > 0 ? 5 : 0;
  const hasDescScore = (skill.description ?? "").length > 50 ? 5 : 0;
  const tagCountScore = Math.min(skill.tags.length, 5);
  const qualityScore = readmeScore + hasTagsScore + hasDescScore + tagCountScore;

  // POPULARITY (0-15)
  const stars = Math.max(skill.repo.starCount, 1);
  const popularityScore = Math.min(15, Math.log10(stars) * 4);

  return Math.round(textScore + qualityScore + popularityScore);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams);
  const parsed = resolveSchema.safeParse(query);

  if (!parsed.success) {
    return corsJson(
      { error: { code: "VALIDATION_ERROR", message: formatZodError(parsed.error) } },
      { status: 400 },
    );
  }

  const { task, limit } = parsed.data;
  const tokens = tokenize(task);

  if (tokens.length === 0) {
    return corsJson(
      { error: { code: "VALIDATION_ERROR", message: "Task must contain meaningful words" } },
      { status: 400 },
    );
  }

  const db = getDb();

  // SQL pre-filter: match any token in name OR description OR tags
  const tokenPatterns = tokens.map((t) => `%${t}%`);
  const tokenFilter = or(
    sql`${skills.name} ILIKE ANY(ARRAY[${sql.join(tokenPatterns.map((p) => sql`${p}`), sql`, `)}])`,
    sql`${skills.description} ILIKE ANY(ARRAY[${sql.join(tokenPatterns.map((p) => sql`${p}`), sql`, `)}])`,
    sql`${skills.tags} && ARRAY[${sql.join(tokens.map((t) => sql`${t}`), sql`, `)}]::text[]`,
  );

  // Count total published skills
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(skills)
    .where(eq(skills.isPublished, true));
  const total = totalResult?.count ?? 0;

  // Fetch matching skills
  const rows = await db
    .select({
      id: skills.id,
      slug: skills.slug,
      name: skills.name,
      description: skills.description,
      tags: skills.tags,
      readmeLength: sql<number>`coalesce(length(${skills.readme}), 0)::int`,
      repo: {
        githubOwner: repos.githubOwner,
        githubRepoName: repos.githubRepoName,
        starCount: repos.starCount,
      },
      owner: {
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(skills)
    .innerJoin(repos, eq(skills.repoId, repos.id))
    .innerJoin(users, eq(skills.ownerId, users.id))
    .where(and(eq(skills.isPublished, true), tokenFilter));

  // Score and sort in JS
  const scored = rows
    .map((row) => ({
      skill: row,
      score: scoreSkill(row as SkillRow, tokens),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const topScore = scored[0]?.score ?? 0;
  const confidence = Math.min(1, topScore / 100);

  const data = scored.map((r) => ({
    skill: {
      id: r.skill.id,
      slug: r.skill.slug,
      name: r.skill.name,
      description: r.skill.description,
      tags: r.skill.tags,
      repo: r.skill.repo,
      owner: r.skill.owner,
    },
    score: r.score,
    confidence: Math.round((r.score / 100) * 100) / 100,
    fetchUrl: `${BASE_URL}/${r.skill.repo.githubOwner ?? r.skill.owner.username}/${r.skill.repo.githubRepoName ?? r.skill.slug}/${r.skill.slug}?format=md`,
  }));

  return corsJson({
    data,
    query: task,
    tokens,
    total,
    matched: scored.length,
  });
}

export { corsOptions as OPTIONS };
