import { getDb } from "@/lib/db";
import { corsJson, methodNotAllowed, OPTIONS as corsOptions, formatZodError } from "@/lib/api-cors";
import { skills, repos, users } from "@skillshub/db/schema";
import { eq, sql, and, or } from "drizzle-orm";
import { z } from "zod";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://skillshub.wtf";

const STOPWORDS = new Set([
  "the", "a", "an", "is", "for", "with", "to", "and", "or", "in", "on", "of",
  "that", "this", "it", "my", "me", "i", "do", "how", "what", "help", "need",
  "want", "please", "can", "should", "would", "could",
  // Common task verbs that don't add specificity
  "set", "up", "setup", "create", "build", "make", "write", "add", "use", "using",
  "get", "run", "start", "new", "project", "app", "application",
]);

const resolveSchema = z.object({
  task: z.string().min(1).max(500),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  threshold: z.coerce.number().min(0).max(1).default(0.3),
});

// Common multi-word phrases that should be treated as single concepts
const PHRASE_MAP: Record<string, string> = {
  "code review": "code-review",
  "infrastructure as code": "infrastructure-as-code",
  "end to end": "e2e",
  "machine learning": "machine-learning",
  "deep learning": "deep-learning",
  "react native": "react-native",
  "pull request": "pull-request",
  "ci cd": "ci-cd",
  "data analysis": "data-analysis",
  "data science": "data-science",
  "web scraping": "web-scraping",
  "smart contract": "smart-contract",
  "docker compose": "docker-compose",
  "unit test": "unit-test",
  "api design": "api-design",
  "code signing": "code-signing",
  "version control": "version-control",
  "security audit": "security-audit",
  "bug bounty": "bug-bounty",
  "web app": "web-app",
  "mobile app": "mobile-app",
};

function tokenize(task: string): string[] {
  let text = task.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");

  // Replace known phrases with hyphenated single tokens BEFORE splitting
  for (const [phrase, token] of Object.entries(PHRASE_MAP)) {
    text = text.replace(new RegExp(phrase, "g"), token);
  }

  return text
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

const MIN_FEEDBACK_FOR_BONUS = 5;

/**
 * Compute the maximum possible text relevance score for a given set of tokens.
 * This is the score a "perfect match" skill would receive: every token matches
 * the skill name exactly, with all bonuses and no penalties.
 */
function maxPossibleScore(tokens: string[], tokenWeights: Map<string, number>): number {
  let textScore = 0;

  // Exact slug/name match boost: +20 (once)
  textScore += 20;

  // Every token matches name exactly: +20 * weight per token
  for (const token of tokens) {
    const w = tokenWeights.get(token) ?? 1;
    textScore += 20 * w;
    // Each token also matches as exact word in description: +6 * w
    textScore += 6 * w;
    // Each token matches a tag: +5 * w
    textScore += 5 * w;
  }

  // Multiple tokens hitting name: +12
  if (tokens.length >= 2) textScore += 12;
  // ALL tokens match name: +20
  if (tokens.length >= 2) textScore += 20;
  // Name coverage 100%: +8
  textScore += 8;
  // Description coverage 100%: +10
  textScore += 10;

  // Cap text at 70
  textScore = Math.min(textScore, 70);

  // Quality max: 8 (readme) + 4 (tags) + 4 (desc) + 4 (tag count) = 20
  const qualityScore = 20;
  // Popularity max: 10
  const popularityScore = 10;
  // Feedback max: 10
  const feedbackBonus = 10;

  return textScore + qualityScore + popularityScore + feedbackBonus;
}

function scoreSkill(skill: SkillRow, tokens: string[], tokenWeights: Map<string, number>): number {
  const nameLower = skill.name.toLowerCase();
  const slugLower = skill.slug.toLowerCase();
  const nameParts = nameLower.split(/[-_\s]+/);
  const descLower = (skill.description ?? "").toLowerCase();
  const descWords = descLower.split(/[\s,.\-_/()]+/).filter(Boolean);
  const tagsLower = skill.tags.map((t) => t.toLowerCase());

  // TEXT RELEVANCE (0-70)
  let textScore = 0;
  let nameHits = 0;
  let descHits = 0;

  // Exact slug/name match boost — highest-impact signal for resolve accuracy
  // If any query token exactly matches the slug or name, +20 points
  for (const token of tokens) {
    if (slugLower === token || nameLower === token) {
      textScore += 20;
      break; // only apply once
    }
  }

  for (const token of tokens) {
    const w = tokenWeights.get(token) ?? 1;

    // Name matching — strongest signal
    if (nameLower === token) {
      textScore += 20 * w;
      nameHits++;
    } else if (nameParts.includes(token)) {
      textScore += 15 * w;
      nameHits++;
    } else if (nameLower.includes(token)) {
      textScore += 8 * w;
      nameHits++;
    }

    // Description matching — boost for exact word match vs substring
    if (descWords.includes(token)) {
      textScore += 6 * w; // exact word in description (was 2)
      descHits++;
    } else if (descLower.includes(token)) {
      textScore += 3 * w; // substring in description
      descHits++;
    }

    // Tag matching
    if (tagsLower.includes(token)) {
      textScore += 5 * w;
    }
  }

  // Bonus: multiple tokens hitting the name = very relevant
  if (nameHits >= 2) textScore += 12;
  // Super bonus: ALL query tokens match the name — this IS the skill
  if (tokens.length >= 2 && nameHits === tokens.length) textScore += 20;

  // Bonus: name coverage ratio — what % of query tokens appear in name?
  const nameCoverage = tokens.length > 0 ? nameHits / tokens.length : 0;
  if (nameCoverage >= 0.75) textScore += 8;

  // Bonus: high description coverage = the skill is about this topic
  const descCoverage = tokens.length > 0 ? descHits / tokens.length : 0;
  if (descCoverage >= 0.6) textScore += 10;
  else if (descCoverage >= 0.4) textScore += 5;

  // Penalty: skill name contains many words NOT in the query = probably a different topic
  // e.g., "azure-resource-manager-playwright-dotnet" for query "playwright e2e testing"
  const nameWordCount = nameParts.length;
  const nameNonMatchRatio = nameWordCount > 0 ? (nameWordCount - nameHits) / nameWordCount : 0;
  if (nameWordCount >= 4 && nameNonMatchRatio > 0.7) textScore -= 5; // long name, mostly unrelated words

  // NEGATIVE SIGNAL: penalize skills whose name contains contradicting domains
  // e.g., query has "nodejs" but skill is "django-perf-review" → penalty
  const DOMAIN_CONFLICTS: Record<string, string[]> = {
    "nodejs": ["django", "flask", "rails", "laravel", "spring"],
    "node": ["django", "flask", "rails", "laravel", "spring"],
    "python": ["dotnet", "csharp", "blazor", "spring", "java"],
    "react": ["angular", "vue", "svelte", "blazor"],
    "vue": ["react", "angular", "svelte"],
    "angular": ["react", "vue", "svelte"],
    "terraform": ["code-signing", "pulumi"],
    "docker": ["jetpack", "android"],
    "ios": ["android"],
    "android": ["ios", "swiftui", "xcode"],
  };

  for (const token of tokens) {
    const conflicts = DOMAIN_CONFLICTS[token];
    if (conflicts && conflicts.some(c => nameLower.includes(c))) {
      textScore -= 15; // significant penalty for wrong domain
    }
  }

  textScore = Math.max(0, Math.min(textScore, 70));

  // QUALITY (0-20) — reduced from 25 to let text relevance dominate
  const readmeLen = Math.max(skill.readmeLength, 1);
  const readmeScore = Math.min(8, Math.max(0, (Math.log2(readmeLen) - 5.2) * (8 / (13.3 - 5.2))));
  const hasTagsScore = skill.tags.length > 0 ? 4 : 0;
  const hasDescScore = (skill.description ?? "").length > 50 ? 4 : 0;
  const tagCountScore = Math.min(skill.tags.length, 4);
  const qualityScore = readmeScore + hasTagsScore + hasDescScore + tagCountScore;

  // POPULARITY (0-10) — reduced from 15
  const stars = Math.max(skill.repo.starCount, 1);
  const popularityScore = Math.min(10, Math.log10(stars) * 3);

  // FEEDBACK BONUS (0-10)
  let feedbackBonus = 0;
  if (skill.helpfulRate !== null && skill.feedbackCount >= MIN_FEEDBACK_FOR_BONUS) {
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
    .sort((a, b) => {
      // Primary: score
      if (b.score !== a.score) return b.score - a.score;
      // Tiebreaker 1: prefer skills where more query tokens appear in the name
      const aNameHits = tokens.filter(t => a.skill.name.toLowerCase().includes(t)).length;
      const bNameHits = tokens.filter(t => b.skill.name.toLowerCase().includes(t)).length;
      if (bNameHits !== aNameHits) return bNameHits - aNameHits;
      // Tiebreaker 2: prefer higher GitHub stars
      return b.skill.repo.starCount - a.skill.repo.starCount;
    });

  const topScore = allScored[0]?.score ?? 0;
  const maxScore = maxPossibleScore(tokens, tokenWeights);

  // Filter by threshold, then cap at limit
  const aboveThreshold = allScored.filter(
    (r) => Math.round((r.score / maxScore) * 100) / 100 >= threshold,
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
      helpfulRate: r.skill.helpfulRate !== null ? Number(r.skill.helpfulRate) : null,
      repo: r.skill.repo,
      owner: r.skill.owner,
    },
    score: r.score,
    confidence: Math.round((r.score / maxScore) * 100) / 100,
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

export async function POST() { return methodNotAllowed(["GET"]); }
export async function PUT() { return methodNotAllowed(["GET"]); }
export async function DELETE() { return methodNotAllowed(["GET"]); }
export async function PATCH() { return methodNotAllowed(["GET"]); }

export { corsOptions as OPTIONS };
