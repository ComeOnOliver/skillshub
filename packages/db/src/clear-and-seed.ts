import "dotenv/config";
import { execSync } from "child_process";
import { createDb } from "./client.js";
import {
  users,
  repos,
  skills,
  stars,
  donations,
  apiKeys,
} from "./schema.js";
import { sql } from "drizzle-orm";

const db = createDb();

// ── Config ──────────────────────────────────────────────────────────────
const REPOS = [
  { owner: "openclaw", repo: "openclaw", limit: 53 },
  { owner: "anthropics", repo: "skills", limit: 17 },
  { owner: "obra", repo: "superpowers", limit: 14 },
  { owner: "affaan-m", repo: "everything-claude-code", limit: 40 },
  { owner: "vercel-labs", repo: "agent-skills", limit: 7 },
  { owner: "kepano", repo: "obsidian-skills", limit: 5 },
  { owner: "muratcankoylan", repo: "Agent-Skills-for-Context-Engineering", limit: 13 },
];

const VERIFIED_ORGS = new Set(["anthropics", "openclaw", "vercel-labs", "obra", "kepano"]);

const TAG_KEYWORDS = [
  "ai", "agent", "code", "review", "testing", "mcp", "rag", "data", "web",
  "design", "security", "automation", "productivity", "devtools", "github",
  "docker", "kubernetes", "deploy", "monitor", "debug", "lint", "format",
  "database", "api", "cli", "plugin", "workflow", "search", "chat", "voice",
  "image", "video", "audio", "file", "git", "ci", "cd", "test", "docs",
  "markdown", "obsidian", "browser", "scrape", "crawl", "llm", "prompt",
  "memory", "context", "tool", "skill", "template", "scaffold", "generate",
  "refactor", "optimize", "build", "package", "server", "client", "frontend",
  "backend", "fullstack", "react", "node", "python", "typescript",
];

// ── Helpers ─────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function ghExec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 30000 }).trim();
  } catch {
    return "";
  }
}

function parseFrontmatter(content: string): { name?: string; description?: string; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { body: content };

  const frontmatter = match[1];
  const body = match[2];

  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descMatch = frontmatter.match(/^description:\s*(.+)$/m);

  let description = descMatch?.[1]?.trim();
  if (descMatch) {
    const lines = frontmatter.split("\n");
    const descIdx = lines.findIndex((l) => l.match(/^description:/));
    if (descIdx >= 0) {
      let full = lines[descIdx].replace(/^description:\s*/, "").trim();
      if (full.startsWith('"') || full.startsWith("'") || full.startsWith("|") || full.startsWith(">")) {
        full = full.replace(/^["'|>]\s*/, "").replace(/["']$/, "");
      }
      description = full;
    }
  }

  return {
    name: nameMatch?.[1]?.trim().replace(/^["']|["']$/g, ""),
    description: description?.replace(/^["']|["']$/g, ""),
    body,
  };
}

function extractTags(description: string, orgName: string, repoTopics: string[]): string[] {
  const tags = new Set<string>();

  // Primary: use actual GitHub repo topics
  for (const topic of repoTopics) {
    tags.add(topic.toLowerCase());
    if (tags.size >= 4) break;
  }

  // Always include the org name
  tags.add(orgName);

  // Fallback: keyword extraction from description if we still need more
  if (tags.size < 3) {
    const lower = (description || "").toLowerCase();
    for (const kw of TAG_KEYWORDS) {
      if (lower.includes(kw)) {
        tags.add(kw);
        if (tags.size >= 5) break;
      }
    }
  }

  if (tags.size < 3) tags.add("ai");
  if (tags.size < 3) tags.add("skill");

  return [...tags].slice(0, 6);
}

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
  console.log("🧹 Clearing existing data...");
  await db.delete(stars);
  await db.delete(donations);
  await db.delete(apiKeys);
  await db.delete(skills);
  await db.delete(repos);
  await db.delete(users);
  console.log("✅ All tables cleared.\n");

  // ── Create users for each repo owner ───────────────────────────────
  const ownerSet = new Set(REPOS.map((r) => r.owner));
  const userMap = new Map<string, string>(); // owner → userId

  for (const owner of ownerSet) {
    console.log(`👤 Fetching user info for ${owner}...`);
    const displayName = ghExec(`gh api users/${owner} --jq '.name'`) || owner;
    const githubId = ghExec(`gh api users/${owner} --jq '.id'`);
    const bio = ghExec(`gh api users/${owner} --jq '.bio'`);
    await sleep(500);

    const [inserted] = await db
      .insert(users)
      .values({
        username: owner,
        displayName: displayName || owner,
        avatarUrl: `https://github.com/${owner}.png`,
        githubId: githubId || null,
        role: "human",
        bio: bio || null,
        isVerified: VERIFIED_ORGS.has(owner),
      })
      .returning({ id: users.id });

    userMap.set(owner, inserted.id);
    console.log(`  ✅ Created user: ${owner} (${displayName}) → ${inserted.id}`);
  }

  console.log(`\n📦 Processing ${REPOS.length} repos...\n`);

  let totalSkills = 0;
  const repoMap = new Map<string, string>(); // "owner/repo" → repoId

  for (const repoConfig of REPOS) {
    const { owner, repo: repoName, limit } = repoConfig;
    const ownerId = userMap.get(owner)!;

    console.log(`📂 ${owner}/${repoName} (limit: ${limit})`);

    // Fetch repo topics from GitHub
    const topicsRaw = ghExec(`gh api repos/${owner}/${repoName}/topics --jq '.names | join(",")'`);
    const repoTopics = topicsRaw ? topicsRaw.split(",").filter(Boolean) : [];
    if (repoTopics.length > 0) {
      console.log(`  🏷️  Topics: ${repoTopics.join(", ")}`);
    }
    await sleep(300);

    // Create repo entry
    const [insertedRepo] = await db
      .insert(repos)
      .values({
        ownerId,
        name: repoName,
        displayName: repoName,
        description: `Skills from ${owner}/${repoName}`,
        githubRepoUrl: `https://github.com/${owner}/${repoName}`,
        githubOwner: owner,
        githubRepoName: repoName,
        language: "Markdown",
        license: null,
        starCount: rand(0, 80),
        downloadCount: rand(100, 20000),
        weeklyInstalls: rand(50, 5000),
      })
      .returning({ id: repos.id });

    const repoId = insertedRepo.id;
    repoMap.set(`${owner}/${repoName}`, repoId);
    console.log(`  📦 Created repo: ${owner}/${repoName} → ${repoId}`);

    // List skill directories
    const dirsRaw = ghExec(
      `gh api repos/${owner}/${repoName}/contents/skills --jq '.[].name'`
    );
    await sleep(500);

    if (!dirsRaw) {
      console.log(`  ⚠️  Could not list skills directory, skipping repo.`);
      continue;
    }

    const dirs = dirsRaw.split("\n").filter(Boolean).slice(0, limit);
    console.log(`  Found ${dirs.length} skill directories`);

    const usedSlugs = new Set<string>();

    for (const dir of dirs) {
      const contentB64 = ghExec(
        `gh api repos/${owner}/${repoName}/contents/skills/${dir}/SKILL.md --jq '.content'`
      );
      await sleep(500);

      if (!contentB64) {
        console.log(`  ⚠️  Skipping ${dir} — SKILL.md not found`);
        continue;
      }

      let content: string;
      try {
        content = Buffer.from(contentB64, "base64").toString("utf-8");
      } catch {
        console.log(`  ⚠️  Skipping ${dir} — base64 decode failed`);
        continue;
      }

      const parsed = parseFrontmatter(content);
      const skillName = parsed.name || dir;
      const description = (parsed.description || `${skillName} skill from ${owner}/${repoName}`).slice(0, 500);

      let slug = dir;
      if (usedSlugs.has(slug)) {
        let i = 2;
        while (usedSlugs.has(`${slug}-${i}`)) i++;
        slug = `${slug}-${i}`;
      }
      usedSlugs.add(slug);

      const tags = extractTags(description, owner, repoTopics);

      try {
        await db.insert(skills).values({
          ownerId,
          repoId,
          slug,
          name: skillName,
          description,
          readme: parsed.body,
          tags,
          installCommand: `npx skillshub add ${owner}/${repoName}/${slug}`,
          isPublished: true,
          source: "github_import",
          importedAt: new Date(),
        });
        totalSkills++;
        console.log(`  ✅ ${slug}: "${skillName}"`);
      } catch (err: any) {
        console.log(`  ❌ Failed to insert ${slug}: ${err.message}`);
      }
    }

    console.log();
  }

  // ── Summary ─────────────────────────────────────────────────────────
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [repoCount] = await db.select({ count: sql<number>`count(*)` }).from(repos);
  const [skillCount] = await db.select({ count: sql<number>`count(*)` }).from(skills);

  console.log("═".repeat(50));
  console.log(`🎉 Seeding complete!`);
  console.log(`   Users:  ${userCount.count}`);
  console.log(`   Repos:  ${repoCount.count}`);
  console.log(`   Skills: ${skillCount.count}`);
  console.log("═".repeat(50));

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
