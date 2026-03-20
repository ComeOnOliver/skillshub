import "dotenv/config";
import { createDb } from "./client.js";
import { users, repos, skills } from "./schema.js";
import { eq, and, sql } from "drizzle-orm";
import matter from "gray-matter";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "skillshub-sync",
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
};

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function getRepoPushedAt(owner: string, repo: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return data.pushed_at;
  } catch { return null; }
}

async function getRepoTree(owner: string, repo: string): Promise<{ path: string; sha: string }[] | null> {
  for (const branch of ["main", "master"]) {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.tree) {
        return data.tree
          .filter((t: any) => t.path.endsWith("SKILL.md"))
          .map((t: any) => ({ path: t.path, sha: t.sha }));
      }
    } catch {}
  }
  return null;
}

async function fetchContent(owner: string, repo: string, path: string): Promise<string | null> {
  for (const b of ["main", "master"]) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${b}/${path}`, {
        headers: { "User-Agent": "skillshub-sync" },
      });
      if (res.ok) return await res.text();
    } catch {}
  }
  return null;
}

function extractSlug(path: string): string {
  const parts = path.replace(/\/SKILL\.md$/i, "").split("/");
  return parts[parts.length - 1] || path;
}

async function main() {
  const db = createDb();
  const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const allRepos = await db
    .select({ repoId: repos.id, owner: repos.githubOwner, repoName: repos.githubRepoName })
    .from(repos)
    .orderBy(repos.githubOwner);

  console.log(`Checking ${allRepos.length} repos — filtering to recently active...\n`);

  let checked = 0, skippedStale = 0, totalUpdated = 0, totalNew = 0, errors = 0;

  for (const repo of allRepos) {
    checked++;
    // Check if repo was pushed recently
    const pushedAt = await getRepoPushedAt(repo.owner, repo.repoName);
    if (!pushedAt || new Date(pushedAt) < SEVEN_DAYS_AGO) {
      skippedStale++;
      if (checked % 50 === 0) console.log(`Progress: ${checked}/${allRepos.length} (${skippedStale} stale, ${totalUpdated} updated, ${totalNew} new)`);
      await sleep(100);
      continue;
    }

    console.log(`\n📦 ${repo.owner}/${repo.repoName} (pushed ${pushedAt.slice(0,10)})`);

    const tree = await getRepoTree(repo.owner, repo.repoName);
    if (!tree) { errors++; await sleep(300); continue; }

    const existingSkills = await db
      .select({ id: skills.id, slug: skills.slug, readme: skills.readme })
      .from(skills)
      .where(and(eq(skills.repoId, repo.repoId), eq(skills.isPublished, true)));
    const existingMap = new Map(existingSkills.map(s => [s.slug, s]));

    for (const file of tree) {
      const slug = extractSlug(file.path);
      const existing = existingMap.get(slug);
      const content = await fetchContent(repo.owner, repo.repoName, file.path);
      if (!content || content.length < 50) continue;

      if (existing) {
        if (existing.readme?.trim() !== content.trim()) {
          let name = slug, description = "";
          try { const { data, content: body } = matter(content); name = data.name || slug; description = (data.description || body.slice(0, 500)).slice(0, 500); } catch { description = content.slice(0, 500); }
          await db.update(skills).set({ readme: content, name, description: description || `Skill: ${name}`, updatedAt: new Date() }).where(eq(skills.id, existing.id));
          totalUpdated++;
          console.log(`  ✏️  Updated: ${slug}`);
        }
      } else {
        let [user] = await db.select().from(users).where(eq(users.username, repo.owner)).limit(1);
        if (!user) { [user] = await db.insert(users).values({ username: repo.owner, role: "human" }).returning(); }
        let name = slug, description = "";
        try { const { data, content: body } = matter(content); name = data.name || slug; description = (data.description || body.slice(0, 500)).slice(0, 500); } catch { description = content.slice(0, 500); }
        try {
          await db.insert(skills).values({ slug, name, description: description || `Skill: ${name}`, readme: content, repoId: repo.repoId, ownerId: user.id, isPublished: true, source: "github" });
          totalNew++;
          console.log(`  ✅ New: ${slug}`);
        } catch(e: any) {
          if (e?.cause?.code === "23505") { /* dupe */ }
          else console.log(`  ⚠️ ${slug}: ${String(e).slice(0,60)}`);
        }
      }
      await sleep(100);
    }
    await sleep(200);
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Sync complete!`);
  console.log(`  Repos checked: ${checked} (${skippedStale} skipped as stale)`);
  console.log(`  Active repos synced: ${checked - skippedStale - errors}`);
  console.log(`  Skills updated: ${totalUpdated}`);
  console.log(`  Skills new: ${totalNew}`);
  console.log(`  Errors: ${errors}`);
}

main().catch(console.error);
