import "dotenv/config";
import { createDb } from "./client";
import { users, repos, skills } from "./schema";
import { sql, eq, and } from "drizzle-orm";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("GITHUB_TOKEN is required");
  process.exit(1);
}

const headers: HeadersInit = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

const SEARCH_QUERIES = [
  "topic:cli stars:>5000 sort:stars",
  "topic:developer-tools stars:>3000 sort:stars",
  "topic:devops stars:>3000 sort:stars",
  "topic:ai stars:>5000 sort:stars",
  "topic:typescript stars:>8000 sort:stars",
  "topic:python stars:>8000 sort:stars",
  "topic:react stars:>5000 sort:stars",
  "topic:nodejs stars:>5000 sort:stars",
  "topic:machine-learning stars:>5000 sort:stars",
  "topic:web stars:>8000 sort:stars",
  "topic:docker stars:>5000 sort:stars",
  "topic:kubernetes stars:>5000 sort:stars",
  "topic:rust stars:>8000 sort:stars",
  "topic:go stars:>8000 sort:stars",
  "topic:database stars:>5000 sort:stars",
];

const TARGET = 500;
const PER_PAGE = 30;

interface GitHubRepo {
  full_name: string;
  name: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  license: { spdx_id: string } | null;
  topics: string[];
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchRepos(): Promise<Map<string, GitHubRepo>> {
  const repoMap = new Map<string, GitHubRepo>();

  for (const query of SEARCH_QUERIES) {
    if (repoMap.size >= TARGET) break;

    const maxPages = Math.min(17, Math.ceil((TARGET - repoMap.size) / PER_PAGE));

    for (let page = 1; page <= maxPages; page++) {
      if (repoMap.size >= TARGET) break;

      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=${PER_PAGE}&page=${page}`;
      console.log(
        `Searching: "${query}" page ${page} (${repoMap.size}/${TARGET} repos)`
      );

      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.error(`Search failed: ${res.status} ${await res.text()}`);
        break;
      }

      const data = await res.json();
      const items: GitHubRepo[] = data.items ?? [];

      if (items.length === 0) break;

      for (const repo of items) {
        if (repoMap.size >= TARGET) break;
        repoMap.set(repo.full_name, repo);
      }

      await sleep(2500); // 30 req/min rate limit
    }
  }

  console.log(`Collected ${repoMap.size} unique repos`);
  return repoMap;
}

async function fetchReadme(
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          ...headers,
          Accept: "application/vnd.github.raw",
        },
      }
    );

    if (!res.ok) return null;

    const text = await res.text();
    return text.slice(0, 50_000); // Truncate at 50KB
  } catch {
    return null;
  }
}

function randomWeeklyInstalls(stars: number): number {
  const base = Math.floor(stars * (0.5 + Math.random() * 2));
  return Math.max(100, base);
}

async function main() {
  const db = createDb();

  console.log("Phase 1: Searching GitHub for repos...");
  const ghRepos = await searchRepos();

  console.log("Phase 2: Upserting users, repos, and skills...");

  // Collect unique owners
  const owners = new Map<
    string,
    { login: string; id: number; avatar_url: string }
  >();
  for (const repo of ghRepos.values()) {
    owners.set(repo.owner.login, repo.owner);
  }

  // Upsert owners
  console.log(`Upserting ${owners.size} users...`);
  const ownerIdMap = new Map<string, string>();
  for (const owner of owners.values()) {
    const [existing] = await db
      .insert(users)
      .values({
        githubId: String(owner.id),
        username: owner.login,
        displayName: owner.login,
        avatarUrl: owner.avatar_url,
        role: "human",
      })
      .onConflictDoNothing({ target: users.githubId })
      .returning({ id: users.id });

    if (existing) {
      ownerIdMap.set(owner.login, existing.id);
    } else {
      const [found] = await db
        .select({ id: users.id })
        .from(users)
        .where(sql`${users.githubId} = ${String(owner.id)}`)
        .limit(1);
      if (found) ownerIdMap.set(owner.login, found.id);
    }
  }

  // Upsert repos and skills
  let count = 0;
  for (const ghRepo of ghRepos.values()) {
    count++;
    const ownerId = ownerIdMap.get(ghRepo.owner.login);
    if (!ownerId) {
      console.warn(`Skipping ${ghRepo.full_name}: owner not found`);
      continue;
    }

    console.log(`[${count}/${ghRepos.size}] Importing ${ghRepo.full_name}...`);

    const readme = await fetchReadme(ghRepo.owner.login, ghRepo.name);
    await sleep(100);

    const weeklyInstalls = randomWeeklyInstalls(ghRepo.stargazers_count);

    // Upsert repo
    const [existingRepo] = await db
      .select({ id: repos.id })
      .from(repos)
      .where(
        and(
          eq(repos.githubOwner, ghRepo.owner.login),
          eq(repos.githubRepoName, ghRepo.name)
        )
      )
      .limit(1);

    let repoId: string;
    if (existingRepo) {
      repoId = existingRepo.id;
      await db
        .update(repos)
        .set({
          githubStars: ghRepo.stargazers_count,
          language: ghRepo.language,
          license: ghRepo.license?.spdx_id ?? null,
          description: ghRepo.description,
          weeklyInstalls,
          updatedAt: new Date(),
        })
        .where(eq(repos.id, repoId));
    } else {
      const [inserted] = await db
        .insert(repos)
        .values({
          ownerId,
          name: ghRepo.name,
          displayName: ghRepo.name,
          description: ghRepo.description,
          githubRepoUrl: ghRepo.html_url,
          githubOwner: ghRepo.owner.login,
          githubRepoName: ghRepo.name,
          githubStars: ghRepo.stargazers_count,
          language: ghRepo.language,
          license: ghRepo.license?.spdx_id ?? null,
          downloadCount: weeklyInstalls,
          weeklyInstalls,
        })
        .returning({ id: repos.id });
      repoId = inserted.id;
    }

    // Upsert skill (one skill per repo in this importer)
    const [existingSkill] = await db
      .select({ id: skills.id })
      .from(skills)
      .where(
        and(
          eq(skills.repoId, repoId),
          eq(skills.slug, ghRepo.name)
        )
      )
      .limit(1);

    if (existingSkill) {
      await db
        .update(skills)
        .set({
          description: ghRepo.description,
          tags: ghRepo.topics.slice(0, 10),
          readme,
          updatedAt: new Date(),
        })
        .where(eq(skills.id, existingSkill.id));
    } else {
      await db.insert(skills).values({
        ownerId,
        repoId,
        slug: ghRepo.name,
        name: ghRepo.name,
        description: ghRepo.description,
        readme,
        tags: ghRepo.topics.slice(0, 10),
        isPublished: true,
        installCommand: `npx skillshub add ${ghRepo.owner.login}/${ghRepo.name}`,
        importedAt: new Date(),
        source: "github_import",
      });
    }
  }

  console.log(`Done! Imported ${count} skills.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
