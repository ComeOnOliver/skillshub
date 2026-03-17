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
  limit: z.coerce.number().int().min(1).max(50).default(10),
  threshold: z.coerce.number().min(0).max(1).default(0.3),
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
  trustScore: string;
  fetchCount: number;
  helpfulRate: string | null;
  feedbackCount: number;
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

function scoreSkill(skill: SkillRow, tokens: string[], tokenWeights: Map<string, number>): number {
  const nameLower = skill.name.toLowerCase();
  const nameParts = nameLower.split(/[-_\s]+/);
  const descLower = (skill.description ?? "").toLowerCase();
  const tagsLower = skill.tags.map((t) => t.toLowerCase());

  // TEXT RELEVANCE (0-60)
  // Each token is weighted by specificity — rare tokens (matching fewer skills) score higher
  let textScore = 0;
  let nameHits = 0;

  for (const token of tokens) {
    const w = tokenWeights.get(token) ?? 1;

    // Name matching — strongest signal, amplified by specificity
    if (nameLower === token) {
      textScore += 20 * w;
      nameHits++;
    } else if (nameParts.includes(token)) {
      textScore += 15 * w; // exact word in name
      nameHits++;
    } else if (nameLower.includes(token)) {
      textScore += 8 * w;
      nameHits++;
    }

    // Description matching — lower weight
    if (descLower.includes(token)) {
      textScore += 2 * w;
    }

    // Tag matching
    if (tagsLower.includes(token)) {
      textScore += 5 * w;
    }
  }

  // Bonus: multiple tokens hitting the name = very relevant
  if (nameHits >= 2) textScore += 12;

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

  // FEEDBACK BONUS (0-10)
  let feedbackBonus = 0;
  if (skill.helpfulRate !== null && skill.feedbackCount >= 5) {
    feedbackBonus = Number(skill.helpfulRate) * 10;
  }

  return Math.round(textScore + qualityScore + popularityScore + feedbackBonus);
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

  const { task, limit, threshold } = parsed.data;
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
      trustScore: skills.trustScore,
      fetchCount: skills.fetchCount,
      helpfulRate: skills.helpfulRate,
      feedbackCount: skills.feedbackCount,
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

  // Compute token specificity weights (IDF-like)
  // Tokens that match fewer skills are more important
  const tokenMatchCounts = new Map<string, number>();
  for (const token of tokens) {
    let count = 0;
    for (const row of rows) {
      const n = row.name.toLowerCase();
      const d = (row.description ?? "").toLowerCase();
      const t = row.tags.map((tag: string) => tag.toLowerCase());
      if (n.includes(token) || d.includes(token) || t.includes(token)) count++;
    }
    tokenMatchCounts.set(token, count);
  }
  const totalMatched = rows.length || 1;
  const tokenWeights = new Map<string, number>();
  for (const [token, count] of tokenMatchCounts) {
    // IDF-inspired: rare tokens get weight up to 3x, common tokens get 1x
    const idf = Math.log2(totalMatched / Math.max(count, 1)) + 1;
    tokenWeights.set(token, Math.min(3, Math.max(1, idf)));
  }

  // Score and sort in JS
  const allScored = rows
    .map((row) => ({
      skill: row,
      score: scoreSkill(row as SkillRow, tokens, tokenWeights),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const topScore = allScored[0]?.score ?? 0;

  // Filter by threshold, then cap at limit
  const aboveThreshold = allScored.filter(
    (r) => Math.round((r.score / 100) * 100) / 100 >= threshold,
  );
  const matched = aboveThreshold.length;
  const scored = aboveThreshold.slice(0, limit);

  const data = scored.map((r) => ({
    skill: {
      id: r.skill.id,
      slug: r.skill.slug,
      name: r.skill.name,
      description: r.skill.description,
      tags: r.skill.tags,
      trustScore: Number(r.skill.trustScore),
      helpfulRate: r.skill.helpfulRate !== null ? Number(r.skill.helpfulRate) : null,
      repo: r.skill.repo,
      owner: r.skill.owner,
    },
    score: r.score,
    confidence: Math.round((r.score / 100) * 100) / 100,
    relativeScore: topScore > 0 ? Math.round((r.score / topScore) * 100) / 100 : 0,
    fetchUrl: `${BASE_URL}/${r.skill.repo.githubOwner ?? r.skill.owner.username}/${r.skill.repo.githubRepoName ?? r.skill.slug}/${r.skill.slug}?format=md`,
  }));

  return corsJson({
    data,
    query: task,
    tokens,
    tokenWeights: Object.fromEntries(tokenWeights),
    total,
    matched,
    threshold,
  });
}

export { corsOptions as OPTIONS };
