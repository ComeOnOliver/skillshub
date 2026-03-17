import "dotenv/config";
import { createDb } from "./client.js";
import { users, repos, skills } from "./schema.js";
import { eq, and, sql } from "drizzle-orm";
import matter from "gray-matter";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "skillshub-importer",
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
};

// Batch 4 — Catalog gap-filling: CI/CD, C++, Unreal, GraphQL, Redis, Nginx, Golang, PHP, etc.
const REPOS_TO_IMPORT = [
  // === Major repos with many skills ===
  { owner: "elizaOS", repo: "eliza" },                         // 17.8k⭐, 110 skills — broad coverage
  { owner: "CherryHQ", repo: "cherry-studio" },                // 41.7k⭐, 6 skills — Electron desktop app (gap 4)
  { owner: "paperclipai", repo: "paperclip" },                 // 28k⭐, 10 skills — CI/CD release skills (gap 1)
  { owner: "pproenca", repo: "dot-skills" },                   // 80⭐, 109 skills — broad curated skills incl nginx (gap 10)
  { owner: "tippyentertainment", repo: "skills" },             // 0⭐, 50 skills — broad coverage incl game dev
  { owner: "noartem", repo: "skills" },                        // 5⭐, 31 skills — Laravel + Vue (gap 15)
  { owner: "stellar", repo: "stellar-core" },                  // 3.3k⭐, 31 skills — C++ build/test (gap 2)

  // === GraphQL (gap 8) ===
  { owner: "apollographql", repo: "skills" },                  // 36⭐, 13 skills — Apollo GraphQL official

  // === Redis / Messaging (gap 9) ===
  { owner: "redis", repo: "agent-skills" },                    // 33⭐, 1 skill — Redis official
  { owner: "RediSearch", repo: "RediSearch" },                 // 6.1k⭐, 13 skills — Redis search module

  // === Nginx / Web servers (gap 10) ===
  { owner: "nejclovrencic", repo: "nginx-agent-skills" },      // 9⭐, 1 skill — Nginx + OpenResty
  { owner: "electric-sql", repo: "electric" },                 // 10k⭐, 10 skills — includes nginx proxy patterns

  // === Unreal Engine (gap 3) ===
  { owner: "quodsoler", repo: "unreal-engine-skills" },        // 64⭐, 27 skills — UE C++ game dev
  { owner: "blackplume233", repo: "UnrealMCPHub" },            // 14⭐, 3 skills — Unreal MCP integration
  { owner: "zoom", repo: "skills" },                           // 13⭐, 47 skills — includes Unreal SDK skill

  // === Golang (gap 14) ===
  { owner: "cxuu", repo: "golang-skills" },                    // 49⭐, 20 skills — Go best practices
  { owner: "saisudhir14", repo: "golang-agent-skill" },        // 5⭐, 1 skill — Go patterns

  // === PHP/Laravel/WordPress (gap 15) ===
  { owner: "wprig", repo: "wprig" },                           // 1.3k⭐, 18 skills — WordPress theme framework
  { owner: "riasvdv", repo: "skills" },                        // 3⭐, 2 skills — Laravel/Craft CMS/PHP
  { owner: "Guikingone", repo: "php-agent-skills" },           // 2⭐, 2 skills — PHP agent skills standard
  { owner: "netresearch", repo: "php-modernization-skill" },   // 8⭐, 1 skill — PHP 8.x modernization

  // === Solidity/Hardhat/Foundry (gap 7) ===
  { owner: "0xlayerghost", repo: "solidity-agent-kit" },       // 1⭐, 9 skills — Foundry/Solidity/DeFi

  // === Kubernetes / DevOps / CI-CD (gap 1) ===
  { owner: "rohitg00", repo: "kubectl-mcp-server" },           // 847⭐, 26 skills — K8s operations
  { owner: "terramate-io", repo: "agent-skills" },             // 28⭐, 2 skills — Terraform CI/CD
  { owner: "agents-infrastructure", repo: "alicloud-agent-skills" }, // 2⭐, 11 skills — Alibaba Cloud infra

  // === C++ tooling (gap 2) ===
  { owner: "Programmer-RD-AI-Archive", repo: "coding-standards-agent-skills" }, // 1⭐, 1 skill — C/C++ standards

  // === Storybook (gap 12) ===
  { owner: "recrsn", repo: "agent-skills" },                   // 0⭐, 5 skills — broad collection

  // === OAuth / Auth (gap 11) ===
  { owner: "vrtalex", repo: "bitrix24-skill" },                // 7⭐, 1 skill — OAuth/webhooks

  // === Desktop apps - Electron (gap 4) ===
  // (CherryHQ/cherry-studio above is an Electron app)

  // === Game dev (bonus) ===
  { owner: "Jahrome907", repo: "minecraft-codex-skills" },     // 3⭐, 37 skills — Minecraft modding
  { owner: "antonioinnovateops", repo: "UnrealEngineAgent" },  // 0⭐, 3 skills — UE5 agents

  // === CI/CD GitHub Actions (gap 1) ===
  { owner: "andrewneilson", repo: "github-actions-skill" },    // 1⭐, 1 skill — GitHub Actions
  { owner: "SpillwaveSolutions", repo: "mastering-github-agent-skill" }, // 1⭐, 1 skill — GitHub CLI/Actions

  // === WordPress toolkit (gap 15) ===
  { owner: "alessioarzenton", repo: "claude-code-wp-toolkit" }, // 9⭐, WordPress dev toolkit
];

const TAG_KEYWORDS: Record<string, string[]> = {
  ai: ["ai", "artificial intelligence", "machine learning", "ml", "llm", "gpt", "claude", "openai"],
  mcp: ["mcp", "model context protocol"],
  frontend: ["react", "vue", "angular", "nextjs", "next.js", "frontend", "css", "tailwind", "ui", "swiftui"],
  backend: ["api", "rest", "graphql", "server", "backend", "express", "fastapi", "django"],
  devops: ["docker", "kubernetes", "k8s", "ci/cd", "deploy", "infrastructure", "terraform", "aws", "gcp", "azure", "cloudflare"],
  database: ["database", "sql", "postgres", "mongodb", "redis", "supabase", "drizzle", "clickhouse", "kafka", "rabbitmq"],
  security: ["security", "auth", "authentication", "encryption", "vulnerability", "pentest", "bug bounty", "oauth", "oidc"],
  testing: ["test", "testing", "jest", "pytest", "cypress", "playwright", "mocha", "chai"],
  mobile: ["mobile", "ios", "android", "react native", "flutter", "expo", "swift"],
  python: ["python", "pip", "django", "flask", "fastapi"],
  typescript: ["typescript", "ts", "deno", "bun"],
  rust: ["rust", "cargo", "wasm"],
  golang: ["golang", "go ", " go,", "goroutine"],
  cpp: ["c++", "cmake", "bazel", "clang", "conan"],
  php: ["php", "laravel", "wordpress", "composer"],
  gamedev: ["unreal", "unity", "game", "minecraft", "godot"],
  graphql: ["graphql", "apollo", "relay", "hasura"],
  data: ["data", "analytics", "pandas", "etl", "pipeline", "scraping", "airflow", "dbt", "spark"],
  coding: ["code", "coding", "refactor", "debug", "review", "programming"],
  writing: ["writing", "documentation", "docs", "markdown", "blog", "content"],
  design: ["design", "figma", "ui/ux", "prototype", "storybook"],
  agent: ["agent", "autonomous", "workflow", "orchestrat", "multi-agent", "skill"],
  infra: ["nginx", "apache", "docker", "kubernetes", "k8s", "ci/cd", "github actions", "jenkins", "gitlab"],
  blockchain: ["solidity", "hardhat", "foundry", "ethereum", "defi", "web3", "solana"],
  desktop: ["electron", "tauri", "desktop"],
};

function autoGenerateTags(name: string, description: string): string[] {
  const tags: string[] = [];
  const text = (name + " " + description).toLowerCase();
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) tags.push(tag);
  }
  return tags.slice(0, 10);
}

function generateSlug(dirName: string): string {
  const slug = dirName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return slug.length === 0 ? "unnamed-skill" : slug;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function githubFetch(url: string): Promise<any> {
  const res = await fetch(url, { headers });
  if (res.status === 403 || res.status === 429) {
    console.log("  ⏳ Rate limited, waiting 60s...");
    await sleep(60000);
    return githubFetch(url);
  }
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${url}`);
  return res.json();
}

async function main() {
  const db = createDb();
  let totalSkillsImported = 0;
  let totalReposImported = 0;
  let errors: string[] = [];

  console.log(`🚀 Importing ${REPOS_TO_IMPORT.length} repos...\n`);

  for (let i = 0; i < REPOS_TO_IMPORT.length; i++) {
    const { owner, repo } = REPOS_TO_IMPORT[i];
    console.log(`[${i + 1}/${REPOS_TO_IMPORT.length}] ${owner}/${repo}`);

    try {
      // 1. Get repo metadata
      const repoData = await githubFetch(`https://api.github.com/repos/${owner}/${repo}`);
      const defaultBranch = repoData.default_branch || "main";

      // 2. Get tree to find SKILL.md files
      const treeData = await githubFetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`
      );

      const skillPaths: string[] = [];
      for (const item of treeData.tree || []) {
        if (item.type === "blob" && item.path.endsWith("/SKILL.md")) {
          skillPaths.push(item.path);
        }
      }
      // Check root SKILL.md
      if (skillPaths.length === 0) {
        for (const item of treeData.tree || []) {
          if (item.type === "blob" && item.path === "SKILL.md") {
            skillPaths.push(item.path);
          }
        }
      }

      if (skillPaths.length === 0) {
        console.log(`  ⚠️ No SKILL.md files found, skipping`);
        errors.push(`${owner}/${repo}: no SKILL.md files`);
        await sleep(500);
        continue;
      }

      console.log(`  📂 Found ${skillPaths.length} SKILL.md files`);

      // 3. Upsert user
      let [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.githubId, String(repoData.owner.id)))
        .limit(1);

      let userId: string;
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Check by username too
        const [byUsername] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.username, repoData.owner.login))
          .limit(1);

        if (byUsername) {
          userId = byUsername.id;
        } else {
          const [created] = await db
            .insert(users)
            .values({
              githubId: String(repoData.owner.id),
              username: repoData.owner.login,
              displayName: repoData.owner.login,
              avatarUrl: repoData.owner.avatar_url,
              role: "human",
            })
            .returning({ id: users.id });
          userId = created.id;
          console.log(`  👤 Created user: ${repoData.owner.login}`);
        }
      }

      // 4. Upsert repo
      let [existingRepo] = await db
        .select({ id: repos.id })
        .from(repos)
        .where(and(eq(repos.githubOwner, owner), eq(repos.githubRepoName, repo)))
        .limit(1);

      let repoId: string;
      if (existingRepo) {
        repoId = existingRepo.id;
        await db
          .update(repos)
          .set({
            starCount: repoData.stargazers_count,
            description: repoData.description,
            updatedAt: new Date(),
          })
          .where(eq(repos.id, repoId));
      } else {
        const [created] = await db
          .insert(repos)
          .values({
            ownerId: userId,
            name: repo,
            displayName: repo,
            description: repoData.description || `Skills from ${owner}/${repo}`,
            githubRepoUrl: repoData.html_url,
            githubOwner: owner,
            githubRepoName: repo,
            starCount: repoData.stargazers_count,
            downloadCount: 0,
            weeklyInstalls: 0,
          })
          .returning({ id: repos.id });
        repoId = created.id;
        totalReposImported++;
      }

      // 5. Fetch and import each skill (batch 5 at a time)
      let skillsInRepo = 0;
      for (let j = 0; j < skillPaths.length; j += 5) {
        const batch = skillPaths.slice(j, j + 5);
        const results = await Promise.allSettled(
          batch.map(async (path) => {
            const contentRes = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
              { headers: { ...headers, Accept: "application/vnd.github.raw" } }
            );
            if (!contentRes.ok) return null;
            return { path, content: await contentRes.text() };
          })
        );

        for (const result of results) {
          if (result.status !== "fulfilled" || !result.value) continue;
          const { path, content } = result.value;

          const parts = path.split("/");
          const dirName =
            parts.length >= 3
              ? parts[parts.length - 2]
              : parts.length === 2
                ? parts[0]
                : repo;

          const { data: frontmatter, content: body } = matter(content);
          const name = (frontmatter.name as string) || dirName;
          const description = ((frontmatter.description as string) || "").slice(0, 500);
          const fmTags: string[] = Array.isArray(frontmatter.tags)
            ? frontmatter.tags.map(String)
            : [];
          const finalTags =
            fmTags.length > 0 ? fmTags : autoGenerateTags(name, description);
          const slug = generateSlug(dirName);

          // Upsert skill
          const [existing] = await db
            .select({ id: skills.id })
            .from(skills)
            .where(and(eq(skills.repoId, repoId), eq(skills.slug, slug)))
            .limit(1);

          if (existing) {
            await db
              .update(skills)
              .set({
                name,
                description: description || undefined,
                readme: body.trim(),
                tags: finalTags,
                updatedAt: new Date(),
              })
              .where(eq(skills.id, existing.id));
          } else {
            await db.insert(skills).values({
              ownerId: userId,
              repoId,
              slug,
              name,
              description: description || `${name} skill from ${owner}/${repo}`,
              readme: body.trim(),
              tags: finalTags,
              isPublished: true,
              importedAt: new Date(),
              source: "github_import",
            });
            totalSkillsImported++;
            skillsInRepo++;
          }
        }
        await sleep(300); // Rate limit friendly
      }

      console.log(`  ✅ Imported ${skillsInRepo} new skills`);
      await sleep(500);
    } catch (err: any) {
      console.log(`  ❌ Error: ${err.message}`);
      errors.push(`${owner}/${repo}: ${err.message}`);
      await sleep(1000);
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`🎉 Import complete!`);
  console.log(`   New repos: ${totalReposImported}`);
  console.log(`   New skills: ${totalSkillsImported}`);
  if (errors.length > 0) {
    console.log(`   Errors (${errors.length}):`);
    errors.forEach((e) => console.log(`     - ${e}`));
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
