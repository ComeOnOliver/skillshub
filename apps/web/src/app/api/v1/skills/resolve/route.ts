import { getDb } from "@/lib/db";
import { corsJson, methodNotAllowed, OPTIONS as corsOptions, formatZodError } from "@/lib/api-cors";
import { skills, repos, users } from "@skillshub/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

/**
 * Resolve v2 — Multi-field BM25 scoring with compound term detection,
 * anchor token weighting, vendor prefix penalty, composite rejection gate,
 * and sigmoid confidence calibration.
 *
 * Replaces TF-IDF + manual patches. See RFC-resolve-v2.md for full rationale.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://skillshub.wtf";

// ─── Validation ───────────────────────────────────────────────────────────────

const resolveSchema = z.object({
  task: z.string().min(1).max(500),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  threshold: z.coerce.number().min(0).max(1).default(0.3),
});

// ─── Stopwords ────────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  "the", "a", "an", "is", "for", "with", "to", "and", "or", "in", "on", "of",
  "that", "this", "it", "my", "me", "i", "do", "how", "what", "help", "need",
  "want", "please", "can", "should", "would", "could",
  // Common task verbs that don't add specificity
  "set", "up", "setup", "create", "build", "make", "write", "add", "use", "using",
  "get", "run", "start", "new", "project", "app", "application",
]);

// ─── Compound Term Dictionary ─────────────────────────────────────────────────
// Maps multi-word phrases → canonical single-token form.
// Two sources:
//   1. Curated PHRASE_MAP for non-obvious mappings (e.g., "end to end" → "e2e")
//   2. Auto-generated from skill slugs: any hyphenated slug becomes a compound
//      (e.g., skill "react-native" generates "react native" → "react-native")

const PHRASE_MAP: Record<string, string> = {
  // Git & VCS
  "pre commit hook": "pre-commit",
  "pre commit": "pre-commit",
  "git hook": "git-hooks",
  "git flow": "gitflow",
  "pull request": "pull-request",
  "merge conflict": "merge-conflict",
  "code review": "code-review",
  // CI/CD
  "github actions": "github-actions",
  "gitlab ci": "gitlab-ci",
  "continuous integration": "ci",
  "continuous deployment": "cd",
  "feature flag": "feature-flags",
  "canary release": "canary-release",
  // Cloud & Infrastructure
  "infrastructure as code": "infrastructure-as-code",
  "load balancer": "load-balancing",
  "api gateway": "api-gateway",
  "service mesh": "service-mesh",
  "secret management": "secrets",
  "container registry": "container-registry",
  "object storage": "object-storage",
  // Frontend
  "react hook": "react-hooks",
  "react native": "react-native",
  "server side rendering": "ssr",
  "static site generator": "ssg",
  "design system": "design-system",
  "component library": "component-library",
  "state management": "state-management",
  // Backend & Data
  "message queue": "message-queue",
  "event driven": "event-driven",
  "rate limiting": "rate-limiting",
  "circuit breaker": "circuit-breaker",
  "database migration": "db-migration",
  "schema validation": "schema-validation",
  "data pipeline": "data-pipeline",
  "stream processing": "stream-processing",
  "connection pool": "connection-pooling",
  // Testing
  "unit test": "unit-testing",
  "end to end": "e2e",
  "integration test": "integration-testing",
  "test coverage": "test-coverage",
  "snapshot test": "snapshot-testing",
  "load test": "load-testing",
  // Security
  "access control": "access-control",
  "single sign on": "sso",
  "two factor": "2fa",
  "cross site scripting": "xss",
  "sql injection": "sql-injection",
  "dependency scanning": "dependency-scanning",
  "vulnerability scanning": "vuln-scanning",
  // DevOps / Tooling
  "ci cd": "ci-cd",
  "machine learning": "machine-learning",
  "deep learning": "deep-learning",
  "data analysis": "data-analysis",
  "data science": "data-science",
  "web scraping": "web-scraping",
  "smart contract": "smart-contract",
  "docker compose": "docker-compose",
  "api design": "api-design",
  "code signing": "code-signing",
  "version control": "version-control",
  "security audit": "security-audit",
  "bug bounty": "bug-bounty",
  "web app": "web-app",
  "mobile app": "mobile-app",
  "mono repo": "monorepo",
  "package manager": "package-manager",
  "type checking": "type-checking",
  "code formatting": "code-formatting",
  "dead code": "dead-code",
  "error tracking": "error-tracking",
  "log aggregation": "logging",
  "feature branch": "feature-branch",
};

// ─── BM25 Parameters ──────────────────────────────────────────────────────────
// k1: term frequency saturation — standard value for short documents
// b: length normalization — reduced because skill descriptions are fairly uniform

const BM25_K1 = 1.2;
const BM25_B = 0.5;

// Multi-field weights: how much each field contributes to the composite score
const FIELD_WEIGHTS: Record<string, number> = {
  name: 5.0,        // Skill slug — exact or near-exact match is the strongest signal
  description: 3.0, // Curated summary text
  tags: 3.5,        // Curated keywords, high precision
};

// ─── Vendor Prefixes ──────────────────────────────────────────────────────────
// Skills with these prefixes are penalized when the query doesn't mention the vendor.
// Generalizes the old hard-coded -15 penalty.

const VENDOR_PREFIXES = new Set([
  "azure", "aws", "gcp", "google", "electric",
  "vercel", "netlify", "cloudflare", "supabase", "firebase",
  "digitalocean", "heroku", "railway", "spring", "react", "microsoft",
]);

// ─── Sigmoid Calibration ──────────────────────────────────────────────────────
// Maps raw scores to probabilities. Bootstrap defaults before labeled data.
// a = steepness, b = midpoint (score where confidence = 0.5)

const SIGMOID_A = 0.15;
const SIGMOID_B = 20.0;

// ─── Rejection Thresholds ─────────────────────────────────────────────────────

const ABSOLUTE_SCORE_FLOOR = 8.0;
const MIN_SPREAD_FOR_DIFFERENTIATION = 2.0;
const LOW_SCORE_CEILING = 15.0;

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ---------------------------------------------------------------------------
// In-memory skill cache (per serverless instance)
// ---------------------------------------------------------------------------
const CACHE_TTL = 300_000; // 5 minutes

interface CorpusStats {
  totalDocs: number;
  avgFieldLengths: { name: number; description: number; tags: number };
  /** token → { name: count, description: count, tags: count } */
  documentFrequencies: Map<string, { name: number; description: number; tags: number }>;
}

interface SkillCache {
  data: SkillRow[];
  stats: CorpusStats;
  timestamp: number;
}

let skillCache: SkillCache | null = null;

interface ScoredResult {
  skill: SkillRow;
  rawScore: number;
  adjustedScore: number;
  matchedTokens: Set<string>;
  anchorHits: number;
  totalAnchors: number;
}

interface RejectionResult {
  rejected: boolean;
  reason: string | null;
  detail: string | null;
}

interface FieldIndex {
  docTokens: string[][];
  avgDl: number;
  df: Map<string, number>;
}

interface BM25Index {
  fields: Record<string, FieldIndex>;
  totalDocs: number;
  globalIdf: Map<string, number>;
}

// ─── Tokenization ─────────────────────────────────────────────────────────────

/** Tokenize a text field into lowercase terms */
function tokenizeField(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 0);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Cache: pre-computed corpus stats
// ---------------------------------------------------------------------------

function buildCorpusStats(rows: SkillRow[]): CorpusStats {
  const totalDocs = rows.length;
  let nameLen = 0;
  let descLen = 0;
  let tagsLen = 0;
  const df = new Map<string, { name: number; description: number; tags: number }>();

  for (const row of rows) {
    const nameTokens = tokenizeField(row.name);
    const descTokens = tokenizeField(row.description ?? "");
    const tagTokens = row.tags.map((t) => t.toLowerCase());

    nameLen += nameTokens.length;
    descLen += descTokens.length;
    tagsLen += tagTokens.length;

    // Unique tokens per field for document frequency
    const nameSet = new Set(nameTokens);
    const descSet = new Set(descTokens);
    const tagSet = new Set(tagTokens);
    const allTokens = new Set([...nameSet, ...descSet, ...tagSet]);

    for (const token of allTokens) {
      let entry = df.get(token);
      if (!entry) {
        entry = { name: 0, description: 0, tags: 0 };
        df.set(token, entry);
      }
      if (nameSet.has(token)) entry.name++;
      if (descSet.has(token)) entry.description++;
      if (tagSet.has(token)) entry.tags++;
    }
  }

  return {
    totalDocs,
    avgFieldLengths: {
      name: totalDocs > 0 ? nameLen / totalDocs : 0,
      description: totalDocs > 0 ? descLen / totalDocs : 0,
      tags: totalDocs > 0 ? tagsLen / totalDocs : 0,
    },
    documentFrequencies: df,
  };
}

async function getSkillCatalog(): Promise<{ cache: SkillCache; cacheHit: boolean; dbMs: number }> {
  const now = Date.now();
  if (skillCache && (now - skillCache.timestamp) < CACHE_TTL) {
    return { cache: skillCache, cacheHit: true, dbMs: 0 };
  }

  const dbStart = performance.now();
  const db = getDb();
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
    .where(eq(skills.isPublished, true));
  const dbMs = Math.round(performance.now() - dbStart);

  const stats = buildCorpusStats(rows as SkillRow[]);
  skillCache = { data: rows as SkillRow[], stats, timestamp: now };
  return { cache: skillCache, cacheHit: false, dbMs };
}

/**
 * Tokenize a query with compound term detection.
 *
 * 1. Normalize to lowercase, strip punctuation
 * 2. Detect compound terms (longest-match-first) from:
 *    - Curated PHRASE_MAP
 *    - Auto-generated from skill slugs (hyphenated slug → space-separated form)
 * 3. Split remaining text, remove stopwords
 */
function tokenizeQuery(
  task: string,
  skillSlugs: Set<string>,
): { tokens: string[]; compounds: string[] } {
  let text = task.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
  const compounds: string[] = [];

  // Merge curated phrases with auto-generated slug compounds
  const compoundMap = new Map<string, string>(Object.entries(PHRASE_MAP));
  for (const slug of skillSlugs) {
    if (slug.includes("-")) {
      const spaced = slug.replace(/-/g, " ");
      if (!compoundMap.has(spaced)) {
        compoundMap.set(spaced, slug);
      }
    }
  }

  // Sort by phrase length descending for greedy longest-match
  const sorted = [...compoundMap.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [phrase, canonical] of sorted) {
    if (text.includes(phrase)) {
      text = text.replace(new RegExp(escapeRegex(phrase), "g"), canonical);
      compounds.push(canonical);
    }
  }

  const tokens = text
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOPWORDS.has(w));

  return { tokens, compounds };
}

// ─── BM25 Index ───────────────────────────────────────────────────────────────

/**
 * Build per-field inverted indexes from the skill corpus.
 * Each field gets its own avg document length and df table,
 * enabling multi-field BM25 with independent length normalization.
 */
function buildIndex(rows: SkillRow[], totalPublished: number): BM25Index {
  const nameTokensList: string[][] = [];
  const descTokensList: string[][] = [];
  const tagTokensList: string[][] = [];

  for (const row of rows) {
    nameTokensList.push(row.slug.toLowerCase().split(/[-_]+/).filter(Boolean));
    descTokensList.push(tokenizeField(row.description ?? ""));
    tagTokensList.push(row.tags.map((t) => t.toLowerCase()));
  }

  function makeFieldIndex(allDocs: string[][]): FieldIndex {
    const df = new Map<string, number>();
    let totalLen = 0;
    for (const doc of allDocs) {
      totalLen += doc.length;
      const seen = new Set<string>();
      for (const t of doc) {
        if (!seen.has(t)) {
          seen.add(t);
          df.set(t, (df.get(t) ?? 0) + 1);
        }
      }
    }
    return { docTokens: allDocs, avgDl: allDocs.length > 0 ? totalLen / allDocs.length : 1, df };
  }

  const fields: Record<string, FieldIndex> = {
    name: makeFieldIndex(nameTokensList),
    description: makeFieldIndex(descTokensList),
    tags: makeFieldIndex(tagTokensList),
  };

  // Global IDF: for each term, take the max IDF across all fields.
  // Used for anchor detection (which tokens are rare/specific).
  const N = totalPublished;
  const globalIdf = new Map<string, number>();
  for (const fi of Object.values(fields)) {
    for (const [term, docFreq] of fi.df) {
      const idf = Math.log((N - docFreq + 0.5) / (docFreq + 0.5) + 1);
      if (idf > (globalIdf.get(term) ?? 0)) globalIdf.set(term, idf);
    }
  }

  return { fields, totalDocs: N, globalIdf };
}

/**
 * BM25 score for a single document field against query tokens.
 *
 * BM25(q, d) = Σ_t [ IDF(t) × tf(t,d)×(k1+1) / (tf(t,d) + k1×(1 - b + b×|d|/avgdl)) ]
 *
 * Also tracks which query tokens matched (for anchor analysis and rejection).
 * Substring matches (e.g., "commit" in "commitlint") get half-weight BM25.
 */
function scoreField(
  queryTokens: string[],
  docTokens: string[],
  fi: FieldIndex,
  N: number,
): { score: number; hits: Set<string> } {
  const hits = new Set<string>();
  let score = 0;

  // Term frequencies in this document
  const tf = new Map<string, number>();
  for (const t of docTokens) tf.set(t, (tf.get(t) ?? 0) + 1);

  const dl = docTokens.length;
  const avgDl = fi.avgDl;

  for (const qt of queryTokens) {
    const freq = tf.get(qt) ?? 0;

    if (freq > 0) {
      // Exact token match — full BM25
      hits.add(qt);
      const df = fi.df.get(qt) ?? 0;
      const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
      score += idf * ((freq * (BM25_K1 + 1)) / (freq + BM25_K1 * (1 - BM25_B + BM25_B * dl / avgDl)));
    } else {
      // Check for substring match (e.g., "commit" in "commitlint", "hook" in "webhooks")
      // This preserves some of v1's fuzzy matching behavior but at reduced weight
      let hasSubstring = false;
      for (const dt of docTokens) {
        if (dt.length > 2 && qt.length > 2 && (dt.includes(qt) || qt.includes(dt))) {
          hasSubstring = true;
          break;
        }
      }
      if (hasSubstring) {
        hits.add(qt);
        const df = fi.df.get(qt) ?? 1;
        const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
        // Treat as tf=0.5, then halve again — substring is a weak signal
        const effectiveTf = 0.5;
        const bm25 = idf * ((effectiveTf * (BM25_K1 + 1)) / (effectiveTf + BM25_K1 * (1 - BM25_B + BM25_B * dl / avgDl)));
        score += bm25 * 0.5;
      }
    }
  }

  return { score, hits };
}

// ─── Anchor Token Detection ───────────────────────────────────────────────────

/**
 * Identify technology-specific "anchor" tokens in the query.
 *
 * Not all tokens are equal. In "set up pre-commit hooks", "pre-commit" is the
 * anchor (the technology) while "hooks" is generic. Anchors are detected by:
 *   1. High IDF — rare in the skill corpus, so specific
 *   2. Matching a skill slug — it's literally a technology name
 *
 * Anchor tokens get extra weight: bonus if all match, penalty if none do.
 */
function detectAnchors(
  queryTokens: string[],
  globalIdf: Map<string, number>,
  skillSlugs: Set<string>,
): string[] {
  if (queryTokens.length === 0) return [];

  const idfValues = queryTokens
    .map((t) => globalIdf.get(t) ?? 0)
    .filter((v) => v > 0);

  // If no tokens have IDF (none appear in corpus), all are anchors
  if (idfValues.length === 0) return [...queryTokens];

  idfValues.sort((a, b) => a - b);
  const medianIdf = idfValues[Math.floor(idfValues.length / 2)];

  const anchors: string[] = [];
  for (const token of queryTokens) {
    const idf = globalIdf.get(token) ?? medianIdf * 2; // Unknown tokens → assume rare
    if (idf > medianIdf * 1.5 || skillSlugs.has(token)) {
      anchors.push(token);
    }
  }

  return anchors.length > 0 ? anchors : [...queryTokens];
}

// ─── Scoring Adjustments ──────────────────────────────────────────────────────

/** Penalize vendor-prefixed skills when the query doesn't mention that vendor */
function vendorPenalty(slug: string, queryTokenSet: Set<string>): number {
  const parts = slug.toLowerCase().split("-");
  if (parts.length < 2) return 0;
  if (VENDOR_PREFIXES.has(parts[0]) && !queryTokenSet.has(parts[0])) return -20.0;
  return 0;
}

/** Penalize when few query tokens matched relative to query length */
function partialMatchPenalty(matchedCount: number, totalTokens: number): number {
  if (totalTokens < 3) return 0;
  const ratio = matchedCount / totalTokens;
  if (ratio < 0.25) return -25.0;
  if (ratio < 0.5) return -10.0;
  return 0;
}

/** Bonus when a detected compound term matches a skill's slug or tags exactly */
function compoundBonus(compounds: string[], skill: SkillRow): number {
  if (compounds.length === 0) return 0;
  let bonus = 0;
  const slugLower = skill.slug.toLowerCase();
  const tagsLower = new Set(skill.tags.map((t) => t.toLowerCase()));
  for (const c of compounds) {
    if (slugLower === c || tagsLower.has(c)) bonus += 15.0;
  }
  return bonus;
}

/** MCP skills should only surface for MCP queries */
function mcpPenalty(skill: SkillRow, queryTokens: string[]): number {
  const s = skill.slug.toLowerCase();
  const n = skill.name.toLowerCase();
  const t = skill.tags.map((x) => x.toLowerCase());
  const isMcp = s.includes("mcp") || n.includes("mcp") || t.includes("mcp");
  if (isMcp && !queryTokens.includes("mcp")) return -30.0;
  return 0;
}

// ─── Quality / Popularity / Feedback (unchanged from v1) ──────────────────────

const MIN_FEEDBACK_FOR_BONUS = 5;

function qualityScore(skill: SkillRow): number {
  const readmeLen = Math.max(skill.readmeLength, 1);
  const readme = Math.min(8, Math.max(0, (Math.log2(readmeLen) - 5.2) * (8 / (13.3 - 5.2))));
  const tags = skill.tags.length > 0 ? 4 : 0;
  const desc = (skill.description ?? "").length > 50 ? 4 : 0;
  const tagCount = Math.min(skill.tags.length, 4);
  return readme + tags + desc + tagCount;
}

function popularityScore(skill: SkillRow): number {
  const stars = Math.max(skill.repo.starCount, 1);
  return Math.min(10, Math.log10(stars) * 3);
}

function feedbackBonus(skill: SkillRow): number {
  if (skill.helpfulRate !== null && skill.feedbackCount >= MIN_FEEDBACK_FOR_BONUS) {
    return Number(skill.helpfulRate) * 10;
  }
  return 0;
}

// ─── Full Scoring Pipeline ────────────────────────────────────────────────────

function scoreSkill(
  skill: SkillRow,
  docIdx: number,
  queryTokens: string[],
  compounds: string[],
  anchors: string[],
  index: BM25Index,
): ScoredResult {
  // 1. Multi-field BM25: score each field independently, combine with weights
  let rawScore = 0;
  const allHits = new Set<string>();

  for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
    const fi = index.fields[field];
    const { score, hits } = scoreField(queryTokens, fi.docTokens[docIdx], fi, index.totalDocs);
    rawScore += weight * score;
    for (const h of hits) allHits.add(h);
  }

  // 2. Anchor analysis: reward full anchor coverage, penalize zero
  const anchorHits = anchors.filter((a) => allHits.has(a)).length;
  let anchorAdj = 0;
  if (anchors.length > 0) {
    if (anchorHits === anchors.length) anchorAdj = 20.0;
    else if (anchorHits === 0) anchorAdj = -15.0;
  }

  // 3. All adjustments
  const querySet = new Set(queryTokens);
  const adjusted = rawScore
    + anchorAdj
    + compoundBonus(compounds, skill)
    + vendorPenalty(skill.slug, querySet)
    + partialMatchPenalty(allHits.size, queryTokens.length)
    + mcpPenalty(skill, queryTokens)
    + qualityScore(skill)
    + popularityScore(skill)
    + feedbackBonus(skill);

  return {
    skill,
    rawScore,
    adjustedScore: adjusted,
    matchedTokens: allHits,
    anchorHits,
    totalAnchors: anchors.length,
  };
}

// ─── Rejection Gate ───────────────────────────────────────────────────────────

/**
 * Multi-signal rejection: decide if the top result is actually a good match.
 * Any single gate can trigger rejection. This replaces v1's "always return something."
 *
 * Gates:
 *   1. Absolute score floor — raw BM25 too low
 *   2. Anchor coverage — technology tokens didn't match
 *   3. Score concentration — top-5 all clustered, nothing stands out
 *   4. Token overlap — too few query tokens matched anything
 */
function shouldReject(results: ScoredResult[], anchors: string[]): RejectionResult {
  if (results.length === 0) {
    return { rejected: true, reason: "no_candidates", detail: "No skills matched any query token" };
  }

  const top = results[0];

  // Gate 1: Absolute score floor
  if (top.adjustedScore < ABSOLUTE_SCORE_FLOOR) {
    return {
      rejected: true,
      reason: "score_too_low",
      detail: `Top score ${top.adjustedScore.toFixed(2)} below floor ${ABSOLUTE_SCORE_FLOOR}`,
    };
  }

  // Gate 2: Anchor coverage — all anchors missed means wrong domain entirely
  if (top.totalAnchors > 0 && top.anchorHits === 0) {
    return {
      rejected: true,
      reason: "no_anchor_match",
      detail: `Query anchors [${anchors.join(", ")}] matched 0 skills`,
    };
  }

  // Gate 3: No differentiation — top-5 scores all clustered together
  if (results.length >= 5) {
    const spread = results[0].adjustedScore - results[4].adjustedScore;
    if (spread < MIN_SPREAD_FOR_DIFFERENTIATION && top.adjustedScore < LOW_SCORE_CEILING) {
      return {
        rejected: true,
        reason: "no_differentiation",
        detail: `Top-5 spread ${spread.toFixed(2)} with low scores — no skill stands out`,
      };
    }
  }

  // Gate 4: Low token overlap
  if (anchors.length > 0 && top.matchedTokens.size / anchors.length < 0.3) {
    return {
      rejected: true,
      reason: "low_token_overlap",
      detail: `Only ${top.matchedTokens.size}/${anchors.length} anchor tokens matched`,
    };
  }

  return { rejected: false, reason: null, detail: null };
}

// ─── Confidence Calibration ───────────────────────────────────────────────────

/**
 * Sigmoid calibration: map adjusted score to a probability-like confidence.
 *
 *   confidence = 1 / (1 + exp(-a × (score - b)))
 *
 * Then reduce by spread factor — if the top result barely beats #2,
 * confidence should be lower even if the absolute score is high.
 *
 * | Score | Spread | ≈ Confidence |
 * |-------|--------|-------------|
 * |   5   |    2   |    0.07     |
 * |  20   |    8   |    0.44     |
 * |  35   |   12   |    0.82     |
 * |  45   |   15   |    0.93     |
 */
function calibrateConfidence(adjustedScore: number, spread: number): number {
  const raw = 1.0 / (1.0 + Math.exp(-SIGMOID_A * (adjustedScore - SIGMOID_B)));
  const spreadFactor = Math.min(1.0, spread / 10.0);
  const adjusted = raw * (0.6 + 0.4 * spreadFactor);
  return Math.round(Math.max(0, Math.min(1, adjusted)) * 1000) / 1000;
}

/** Ambiguity: how close the runner-up is to the top result (0 = clear winner, 1 = tied) */
function computeAmbiguity(topScore: number, runnerUpScore: number): number {
  if (topScore <= 0) return 1.0;
  return Math.round(Math.min(1, runnerUpScore / topScore) * 1000) / 1000;
}

// ---------------------------------------------------------------------------
// JS pre-filter (replaces SQL token filter — works against cached data)
// ---------------------------------------------------------------------------

function preFilterSkills(allSkills: SkillRow[], tokens: string[]): SkillRow[] {
  return allSkills.filter((row) => {
    const n = row.name.toLowerCase();
    const d = (row.description ?? "").toLowerCase();
    const t = row.tags.map((tag) => tag.toLowerCase());
    return tokens.some((token) => n.includes(token) || d.includes(token) || t.includes(token));
  });
}

// ─── GET Handler ──────────────────────────────────────────────────────────────

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

  // Fetch skill catalog (from cache or DB)
  const { cache, cacheHit, dbMs } = await getSkillCatalog();
  const { data: allSkills, stats } = cache;
  const total = stats.totalDocs;

  // Collect all skill slugs for compound term auto-generation
  const skillSlugs = new Set(allSkills.map((r) => r.slug.toLowerCase()));

  // Tokenize query: detect compound terms, remove stopwords
  const { tokens, compounds } = tokenizeQuery(task, skillSlugs);

  if (tokens.length === 0) {
    return corsJson(
      { error: { code: "VALIDATION_ERROR", message: "Task must contain meaningful words" } },
      { status: 400 },
    );
  }

  // Pre-filter in JS (replaces SQL ILIKE/array overlap filter)
  const scoreStart = performance.now();
  const filtered = preFilterSkills(allSkills, tokens);

  // Build BM25 inverted index across all three fields
  const index = buildIndex(filtered as SkillRow[], total);

  // Detect anchor tokens: technology-specific, high-IDF terms
  const anchors = detectAnchors(tokens, index.globalIdf, skillSlugs);

  // Score every skill
  const scored = filtered.map((row, i) =>
    scoreSkill(row as SkillRow, i, tokens, compounds, anchors, index),
  );

  // Sort: adjusted score descending, then name-hit count, then stars
  scored.sort((a, b) => {
    if (b.adjustedScore !== a.adjustedScore) return b.adjustedScore - a.adjustedScore;
    const aHits = tokens.filter((t) => a.skill.slug.toLowerCase().includes(t)).length;
    const bHits = tokens.filter((t) => b.skill.slug.toLowerCase().includes(t)).length;
    if (bHits !== aHits) return bHits - aHits;
    return b.skill.repo.starCount - a.skill.repo.starCount;
  });

  const positive = scored.filter((r) => r.adjustedScore > 0);
  const topScore = positive[0]?.adjustedScore ?? 0;
  const runnerUp = positive[1]?.adjustedScore ?? 0;
  const spread = topScore - runnerUp;
  const ambiguity = computeAmbiguity(topScore, runnerUp);

  // Rejection gate
  const rejection = shouldReject(positive, anchors);

  // IDF-based token weights using pre-computed corpus stats
  const tokenWeights: Record<string, number> = {};
  for (const t of tokens) {
    const df = stats.documentFrequencies.get(t);
    const count = df ? Math.max(df.name, df.description, df.tags) : 0;
    const idf = Math.log2(total / Math.max(count, 1)) + 1;
    tokenWeights[t] = Math.round(Math.min(3, Math.max(1, idf)) * 100) / 100;
  }

  const scoreMs = Math.round(performance.now() - scoreStart);

  // Build fetch URL for a skill
  const fetchUrl = (r: SkillRow) =>
    `${BASE_URL}/${r.repo.githubOwner ?? r.owner.username}/${r.repo.githubRepoName ?? r.slug}/${r.slug}?format=md`;

  // Format a scored result for the response
  const formatResult = (r: ScoredResult) => ({
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
    score: Math.round(r.adjustedScore * 100) / 100,
    confidence: calibrateConfidence(r.adjustedScore, spread),
    relativeScore: topScore > 0 ? Math.round((r.adjustedScore / topScore) * 100) / 100 : 0,
    fetchUrl: fetchUrl(r.skill),
  });

  // Build timing headers
  const timingParts = [`cache;desc=${cacheHit ? "hit" : "miss"}`];
  if (!cacheHit) timingParts.push(`db;dur=${dbMs}`);
  timingParts.push(`score;dur=${scoreMs}`);

  const headers = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    "Server-Timing": timingParts.join(", "),
  };

  // ── Rejected: no good match ──
  if (rejection.rejected) {
    const nearMiss = positive[0]
      ? {
            skill: positive[0].skill.slug,
            confidence: calibrateConfidence(positive[0].adjustedScore, spread),
            reason: `Partial match rejected: ${rejection.reason}`,
          }
      : undefined;

    return corsJson(
      {
        data: positive.slice(0, limit).map(formatResult),
        query: task,
        tokens,
        tokenWeights,
        total,
        matched: 0,
        threshold,
        noMatchReason: rejection.reason,
        noMatchDetail: rejection.detail,
        nearMiss,
        ambiguity,
      },
      { headers },
    );
  }

  // ── Matched: apply threshold and return ──
  const aboveThreshold = positive.filter(
    (r) => calibrateConfidence(r.adjustedScore, spread) >= threshold,
  );

  return corsJson(
    {
      data: aboveThreshold.slice(0, limit).map(formatResult),
      query: task,
      tokens,
      tokenWeights,
      total,
      matched: aboveThreshold.length,
      threshold,
      ambiguity,
    },
    { headers },
  );
}

export async function POST() { return methodNotAllowed(["GET"]); }
export async function PUT() { return methodNotAllowed(["GET"]); }
export async function DELETE() { return methodNotAllowed(["GET"]); }
export async function PATCH() { return methodNotAllowed(["GET"]); }

export { corsOptions as OPTIONS };
