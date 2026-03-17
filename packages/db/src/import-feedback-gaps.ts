import "dotenv/config";
import { createDb } from "./client.js";
import { users, repos, skills } from "./schema.js";
import { eq, and } from "drizzle-orm";
import matter from "gray-matter";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "skillshub-importer",
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
};

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

// ==========================================
// GAP-FILLING REPOS
// ==========================================
// These repos contain skills that specifically address gaps
// identified by the 10-agent feedback test:
//
// Gap 1: Appium mobile testing → TerminalSkills/skills (appium)
// Gap 2: Rust CLI (clap, tokio) → TerminalSkills/skills (tokio) + Programmer-RD-AI-Archive (rust)
// Gap 3: Chart.js / D3 dashboards → TerminalSkills/skills (d3, echarts, recharts)
// Gap 4: Node.js security review → TerminalSkills/skills (security-audit, webhook-security)
// Gap 5: Docker Compose orchestration → TerminalSkills/skills (docker-helper)
// Gap 6: Detox React Native testing → TerminalSkills/skills (detox) + callstackincubator
// Gap 7: Solana development → TerminalSkills/skills (solana) + solana-foundation
// Gap 8: Nginx reverse proxy → TerminalSkills/skills (nginx)
//
// Some gaps require NEW curated skills (chartjs, clap, docker-compose, nodejs-security)

const REPOS_TO_IMPORT = [
  // Solana-specific from official foundation
  { owner: "solana-foundation", repo: "solana-dev-skill" },
  // React Native from Callstack (Detox experts)
  { owner: "callstackincubator", repo: "agent-skills" },
  // Percolator for Solana
  { owner: "agentic-reserve", repo: "percolator-agent-skill" },
  // Coding standards (has Rust)
  { owner: "Programmer-RD-AI-Archive", repo: "coding-standards-agent-skills" },
];

// ==========================================
// CURATED SKILLS — hand-crafted for gaps
// ==========================================
// These fill gaps where no good GitHub repo exists yet
const CURATED_SKILLS: Array<{
  slug: string;
  name: string;
  description: string;
  tags: string[];
  readme: string;
}> = [
  {
    slug: "chartjs",
    name: "Chart.js",
    description:
      "Build responsive charts and dashboards with Chart.js. Use when creating bar charts, line charts, pie charts, doughnut charts, radar charts, or real-time updating dashboards in JavaScript/TypeScript applications.",
    tags: ["frontend", "data", "typescript", "coding"],
    readme: `# Chart.js Skill

Use when building charts and dashboards with Chart.js (v4+).

## Key Patterns

### Installation
\`\`\`bash
npm install chart.js
\`\`\`

### Basic Chart
\`\`\`typescript
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const ctx = document.getElementById('myChart') as HTMLCanvasElement;
new Chart(ctx, {
  type: 'bar', // 'line' | 'pie' | 'doughnut' | 'radar' | 'scatter' | 'bubble'
  data: {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{
      label: 'Revenue',
      data: [12, 19, 3],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Monthly Revenue' } },
    scales: { y: { beginAtZero: true } }
  }
});
\`\`\`

### React Integration (react-chartjs-2)
\`\`\`tsx
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function Dashboard({ data }) {
  return <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
}
\`\`\`

### Real-time Updates
\`\`\`typescript
function addData(chart: Chart, label: string, newData: number) {
  chart.data.labels!.push(label);
  chart.data.datasets.forEach((dataset) => dataset.data.push(newData));
  chart.update('none'); // skip animation for perf
}
\`\`\`

### Dashboard Layout Best Practices
- Use \`responsive: true\` and \`maintainAspectRatio: false\` for grid layouts
- Register only needed components for smaller bundle: \`Chart.register(BarElement, CategoryScale, ...)\`
- Use \`chart.destroy()\` before recreating to prevent memory leaks
- For 10k+ data points, use \`decimation\` plugin or sample data

### Plugin System
\`\`\`typescript
const customPlugin = {
  id: 'customBackground',
  beforeDraw: (chart: Chart) => {
    const { ctx, chartArea } = chart;
    ctx.save();
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
    ctx.restore();
  }
};
\`\`\`

## Common Pitfalls
- Canvas not found: ensure DOM is ready before creating chart
- Memory leaks: always call \`chart.destroy()\` in cleanup/unmount
- Tree-shaking: use named imports from 'chart.js' for smaller bundles
- SSR: Chart.js requires \`<canvas>\` — use dynamic import or \`next/dynamic\` with \`ssr: false\`
`,
  },
  {
    slug: "rust-clap-cli",
    name: "Rust CLI with Clap",
    description:
      "Build command-line tools in Rust using clap for argument parsing. Use when creating CLI applications, argument parsers, subcommand handlers, or terminal tools with clap derive macros or builder patterns.",
    tags: ["rust", "coding"],
    readme: `# Rust CLI with Clap

Use when building CLI tools in Rust with clap (v4+).

## Setup
\`\`\`toml
# Cargo.toml
[dependencies]
clap = { version = "4", features = ["derive"] }
tokio = { version = "1", features = ["full"] }  # if async needed
anyhow = "1"
\`\`\`

## Derive API (Preferred)
\`\`\`rust
use clap::{Parser, Subcommand, Args, ValueEnum};

#[derive(Parser)]
#[command(name = "mytool", version, about = "My awesome CLI tool")]
struct Cli {
    /// Enable verbose output
    #[arg(short, long, action = clap::ArgAction::Count)]
    verbose: u8,

    /// Config file path
    #[arg(short, long, default_value = "config.toml")]
    config: String,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new project
    Init {
        /// Project name
        name: String,
        /// Template to use
        #[arg(short, long, value_enum, default_value_t = Template::Default)]
        template: Template,
    },
    /// Run the server
    Serve(ServeArgs),
    /// Build the project
    Build {
        /// Enable release mode
        #[arg(long)]
        release: bool,
    },
}

#[derive(Args)]
struct ServeArgs {
    /// Port to listen on
    #[arg(short, long, default_value_t = 8080)]
    port: u16,
    /// Host to bind
    #[arg(long, default_value = "127.0.0.1")]
    host: String,
}

#[derive(Clone, ValueEnum)]
enum Template {
    Default,
    Minimal,
    Full,
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Init { name, template } => {
            println!("Creating project: {name}");
        }
        Commands::Serve(args) => {
            println!("Serving on {}:{}", args.host, args.port);
        }
        Commands::Build { release } => {
            println!("Building (release={})", release);
        }
    }
    Ok(())
}
\`\`\`

## Key Patterns

### Async CLI with Tokio
\`\`\`rust
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    // async operations here
    Ok(())
}
\`\`\`

### Environment Variable Fallback
\`\`\`rust
#[arg(long, env = "MY_API_KEY")]
api_key: Option<String>,
\`\`\`

### Stdin/File Input
\`\`\`rust
#[arg(default_value = "-")]
input: String, // "-" means stdin
\`\`\`

### Progress Bars (indicatif)
\`\`\`rust
use indicatif::{ProgressBar, ProgressStyle};
let pb = ProgressBar::new(100);
pb.set_style(ProgressStyle::with_template("{bar:40.cyan/blue} {pos}/{len}")?);
\`\`\`

### Colored Output (colored)
\`\`\`rust
use colored::Colorize;
eprintln!("{} Something went wrong", "error:".red().bold());
\`\`\`

## Best Practices
- Use \`#[command(version, about)]\` — pulls from Cargo.toml automatically
- Use \`anyhow::Result\` for error handling in CLI apps
- Write integration tests with \`assert_cmd\` and \`predicates\`
- Use \`#[arg(value_parser)]\` for custom validation
- Add shell completions: \`clap_complete\` crate
`,
  },
  {
    slug: "docker-compose-orchestration",
    name: "Docker Compose Orchestration",
    description:
      "Orchestrate multi-container applications with Docker Compose. Use when defining services, networks, volumes, health checks, dependency ordering, environment configuration, or production deployments with docker compose.",
    tags: ["devops", "backend", "coding"],
    readme: `# Docker Compose Orchestration

Use when orchestrating multi-container applications with Docker Compose (v2+).

## Compose File Structure
\`\`\`yaml
# compose.yaml (preferred over docker-compose.yml)
name: myapp

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          memory: 512M

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 256mb
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app

  worker:
    build: .
    command: node worker.js
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    driver: bridge
\`\`\`

## Key Commands
\`\`\`bash
docker compose up -d              # Start all services detached
docker compose up -d --build      # Rebuild and start
docker compose down               # Stop and remove containers
docker compose down -v            # Also remove volumes
docker compose logs -f app        # Follow logs for service
docker compose exec app sh        # Shell into running container
docker compose ps                 # List running services
docker compose pull               # Pull latest images
docker compose config             # Validate and view merged config
\`\`\`

## Environment Management
\`\`\`yaml
# Use .env file (auto-loaded)
services:
  app:
    env_file:
      - .env
      - .env.local  # overrides
    environment:
      - NODE_ENV=\${NODE_ENV:-production}
\`\`\`

## Multi-stage Profiles
\`\`\`yaml
services:
  app:
    profiles: []  # always started
  debug:
    profiles: ["dev"]
    image: busybox
  test:
    profiles: ["test"]
    build:
      target: test
\`\`\`
\`\`\`bash
docker compose --profile dev up   # Start with dev profile
\`\`\`

## Production Patterns
- Always use \`healthcheck\` + \`depends_on.condition: service_healthy\`
- Set \`restart: unless-stopped\` for production services
- Use named volumes for persistent data, never bind mounts in prod
- Pin image versions (e.g., \`postgres:16.2-alpine\`, not \`postgres:latest\`)
- Use \`deploy.resources\` to set memory/CPU limits
- Use \`docker compose watch\` for development hot-reload

## Common Pitfalls
- Port conflicts: check \`docker compose ps\` and \`lsof -i :PORT\`
- Volume permissions: use \`user: "\${UID}:\${GID}"\` or init scripts
- Network issues: services communicate via service name, not localhost
- Build cache: use \`docker compose build --no-cache\` to force rebuild
`,
  },
  {
    slug: "nodejs-security-review",
    name: "Node.js Security Review",
    description:
      "Audit Node.js applications for security vulnerabilities. Use when reviewing npm dependencies, checking for injection attacks, securing Express/Fastify APIs, implementing auth, preventing prototype pollution, or hardening Node.js deployments.",
    tags: ["security", "backend", "typescript", "coding"],
    readme: `# Node.js Security Review

Use when auditing Node.js/TypeScript applications for security vulnerabilities.

## Dependency Audit
\`\`\`bash
npm audit                          # Check known vulnerabilities
npm audit fix                      # Auto-fix where possible
npm audit --production             # Only production deps
npx better-npm-audit audit         # Stricter thresholds
npx snyk test                      # Deeper analysis (needs auth)
\`\`\`

## Common Vulnerability Patterns

### 1. Injection Attacks
\`\`\`typescript
// ❌ SQL Injection
db.query(\`SELECT * FROM users WHERE id = \${req.params.id}\`);
// ✅ Parameterized queries
db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);

// ❌ Command injection
exec(\`ls \${userInput}\`);
// ✅ Use execFile with args array
execFile('ls', [userInput]);

// ❌ Path traversal
fs.readFile(path.join('/uploads', req.params.filename));
// ✅ Validate and resolve
const safePath = path.resolve('/uploads', req.params.filename);
if (!safePath.startsWith('/uploads/')) throw new Error('Invalid path');
\`\`\`

### 2. Prototype Pollution
\`\`\`typescript
// ❌ Vulnerable to __proto__ pollution
function merge(target, source) {
  for (const key in source) target[key] = source[key];
}
// ✅ Filter dangerous keys
function safeMerge(target: Record<string, unknown>, source: Record<string, unknown>) {
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    target[key] = source[key];
  }
}
\`\`\`

### 3. Authentication & Sessions
\`\`\`typescript
// ✅ Secure session configuration
app.use(session({
  secret: process.env.SESSION_SECRET!, // strong random secret
  name: '__session',                   // don't use default 'connect.sid'
  cookie: {
    httpOnly: true,                    // no JS access
    secure: true,                      // HTTPS only
    sameSite: 'strict',                // CSRF protection
    maxAge: 3600000,                   // 1 hour
  },
  resave: false,
  saveUninitialized: false,
}));

// ✅ Rate limiting
import rateLimit from 'express-rate-limit';
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));
\`\`\`

### 4. Express/Fastify Hardening
\`\`\`typescript
import helmet from 'helmet';
import cors from 'cors';

app.use(helmet());                     // Security headers
app.use(cors({ origin: ['https://myapp.com'], credentials: true }));
app.disable('x-powered-by');          // Don't reveal Express

// ✅ Input validation with zod
import { z } from 'zod';
const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150),
});
app.post('/users', (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json(result.error);
});
\`\`\`

### 5. Secret Management
\`\`\`typescript
// ❌ Hardcoded secrets
const API_KEY = "sk-1234567890";
// ✅ Environment variables with validation
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY is required");

// ✅ .gitignore
// .env, .env.local, *.pem, *.key
\`\`\`

### 6. Error Handling
\`\`\`typescript
// ❌ Leaking stack traces
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.stack });
});
// ✅ Generic errors in production
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});
\`\`\`

## Security Checklist
- [ ] \`npm audit\` shows 0 high/critical vulnerabilities
- [ ] All user input validated (zod, joi, or similar)
- [ ] Parameterized DB queries (no string interpolation)
- [ ] Helmet.js for HTTP security headers
- [ ] CORS properly configured (not \`*\` in production)
- [ ] Rate limiting on auth and sensitive endpoints
- [ ] Secrets in env vars, not code
- [ ] \`.env\` files in \`.gitignore\`
- [ ] HTTPS enforced in production
- [ ] Session cookies: httpOnly, secure, sameSite
- [ ] No \`eval()\`, \`Function()\`, or \`vm.runInNewContext()\` with user input
- [ ] File upload validation (size, type, path)
- [ ] Error responses don't leak internals in production
- [ ] Dependencies pinned and regularly updated
`,
  },
];

async function main() {
  const db = createDb();
  let totalSkillsImported = 0;
  let totalReposImported = 0;
  let errors: string[] = [];

  // ========================================
  // PART 1: Import from GitHub repos
  // ========================================
  console.log(`🚀 Part 1: Importing ${REPOS_TO_IMPORT.length} gap-filling repos...\n`);

  for (let i = 0; i < REPOS_TO_IMPORT.length; i++) {
    const { owner, repo } = REPOS_TO_IMPORT[i];
    console.log(`[${i + 1}/${REPOS_TO_IMPORT.length}] ${owner}/${repo}`);

    try {
      const repoData = await githubFetch(`https://api.github.com/repos/${owner}/${repo}`);
      const defaultBranch = repoData.default_branch || "main";

      const treeData = await githubFetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`
      );

      const skillPaths: string[] = [];
      for (const item of treeData.tree || []) {
        if (item.type === "blob" && item.path.endsWith("/SKILL.md")) {
          // Skip test skills
          if (item.path.includes("test") && !item.path.includes("skills/test")) continue;
          skillPaths.push(item.path);
        }
      }
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

      // Upsert user
      let [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.githubId, String(repoData.owner.id)))
        .limit(1);

      let userId: string;
      if (existingUser) {
        userId = existingUser.id;
      } else {
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

      // Upsert repo
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

      // Fetch and import skills
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

          const slug = dirName
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "") || "unnamed-skill";

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
                tags: fmTags.length > 0 ? fmTags : undefined,
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
              tags: fmTags,
              isPublished: true,
              importedAt: new Date(),
              source: "github_import",
            });
            totalSkillsImported++;
            skillsInRepo++;
          }
        }
        await sleep(300);
      }

      console.log(`  ✅ Imported ${skillsInRepo} new skills`);
      await sleep(500);
    } catch (err: any) {
      console.log(`  ❌ Error: ${err.message}`);
      errors.push(`${owner}/${repo}: ${err.message}`);
      await sleep(1000);
    }
  }

  // ========================================
  // PART 2: Import curated gap-filling skills
  // ========================================
  console.log(`\n🎯 Part 2: Importing ${CURATED_SKILLS.length} curated gap-filling skills...\n`);

  // Get or create a "skillshub-curated" user and repo
  const curatedOwner = "skillshub-team";
  const curatedRepoName = "gap-fillers";

  let [curatedUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, curatedOwner))
    .limit(1);

  let curatedUserId: string;
  if (curatedUser) {
    curatedUserId = curatedUser.id;
  } else {
    const [created] = await db
      .insert(users)
      .values({
        username: curatedOwner,
        displayName: "SkillsHub Curated",
        role: "human",
      })
      .returning({ id: users.id });
    curatedUserId = created.id;
    console.log(`  👤 Created curated user: ${curatedOwner}`);
  }

  let [curatedRepo] = await db
    .select({ id: repos.id })
    .from(repos)
    .where(and(eq(repos.githubOwner, curatedOwner), eq(repos.githubRepoName, curatedRepoName)))
    .limit(1);

  let curatedRepoId: string;
  if (curatedRepo) {
    curatedRepoId = curatedRepo.id;
  } else {
    const [created] = await db
      .insert(repos)
      .values({
        ownerId: curatedUserId,
        name: curatedRepoName,
        displayName: "Gap-Filling Skills",
        description: "Curated skills to fill gaps identified by agent feedback testing",
        githubOwner: curatedOwner,
        githubRepoName: curatedRepoName,
        starCount: 0,
        downloadCount: 0,
        weeklyInstalls: 0,
      })
      .returning({ id: repos.id });
    curatedRepoId = created.id;
    totalReposImported++;
    console.log(`  📦 Created curated repo: ${curatedRepoName}`);
  }

  for (const skill of CURATED_SKILLS) {
    const [existing] = await db
      .select({ id: skills.id })
      .from(skills)
      .where(and(eq(skills.repoId, curatedRepoId), eq(skills.slug, skill.slug)))
      .limit(1);

    if (existing) {
      await db
        .update(skills)
        .set({
          name: skill.name,
          description: skill.description,
          readme: skill.readme.trim(),
          tags: skill.tags,
          updatedAt: new Date(),
        })
        .where(eq(skills.id, existing.id));
      console.log(`  ♻️  Updated: ${skill.name}`);
    } else {
      await db.insert(skills).values({
        ownerId: curatedUserId,
        repoId: curatedRepoId,
        slug: skill.slug,
        name: skill.name,
        description: skill.description,
        readme: skill.readme.trim(),
        tags: skill.tags,
        isPublished: true,
        importedAt: new Date(),
        source: "github_import",
      });
      totalSkillsImported++;
      console.log(`  ✅ Created: ${skill.name}`);
    }
  }

  // ========================================
  // Summary
  // ========================================
  console.log(`\n${"=".repeat(50)}`);
  console.log(`🎉 Gap-filling import complete!`);
  console.log(`   New repos: ${totalReposImported}`);
  console.log(`   New skills: ${totalSkillsImported}`);
  console.log(`\n📋 Gaps addressed:`);
  console.log(`   1. Appium mobile testing → TerminalSkills already has it`);
  console.log(`   2. Rust CLI (clap) → NEW curated "rust-clap-cli" skill`);
  console.log(`   3. Chart.js dashboards → NEW curated "chartjs" skill`);
  console.log(`   4. Node.js security → NEW curated "nodejs-security-review" skill`);
  console.log(`   5. Docker Compose → NEW curated "docker-compose-orchestration" skill`);
  console.log(`   6. Detox RN testing → callstackincubator/agent-skills imported`);
  console.log(`   7. Solana development → solana-foundation/solana-dev-skill imported`);
  console.log(`   8. Nginx reverse proxy → TerminalSkills already has it`);

  if (errors.length > 0) {
    console.log(`\n   Errors (${errors.length}):`);
    errors.forEach((e) => console.log(`     - ${e}`));
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
