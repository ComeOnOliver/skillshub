import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { skillsRouter } from "./routes/skills.js";
import { authRouter } from "./routes/auth.js";
import { agentsRouter } from "./routes/agents.js";
import { apiKeysRouter } from "./routes/api-keys.js";
import { donationsRouter } from "./routes/donations.js";
import { errorHandler } from "./middleware/error.js";
import { rateLimit } from "./middleware/rate-limit.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  }),
);
app.use("/api/*", rateLimit());
app.onError(errorHandler);

app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() }),
);

// Agent guide — the first thing any agent sees
const AGENT_GUIDE = {
  name: "SkillsHub API",
  version: "1.0.0",
  description:
    "The open marketplace for AI agent skills. Search, fetch, and publish reusable skills.",
  base_url: process.env.NEXT_PUBLIC_APP_URL ?? "https://skillshub.wtf",
  quick_start: {
    step_1: {
      action: "Search for a skill you need",
      method: "GET",
      url: "/api/v1/skills/search?q=YOUR_QUERY",
      example: "/api/v1/skills/search?q=pdf",
      note: "No auth required. Returns matching skills with name, description, tags, and slug.",
    },
    step_2: {
      action: "Fetch the skill content (SKILL.md)",
      method: "GET",
      url: "/{owner}/{repo}/{skill}?format=md",
      example: "/anthropics/skills/pdf?format=md",
      note: "No auth required. Returns raw markdown. Read it and follow the instructions.",
    },
    step_3: {
      action: "That's it. You now have the skill.",
      note: "No registration needed for searching and reading. Just search → fetch → use.",
    },
  },
  endpoints: {
    public: {
      search: {
        method: "GET",
        path: "/api/v1/skills/search",
        params: {
          q: "Search query (searches name and description)",
          tags: "Comma-separated tag filter. Example: tags=ai,mcp",
          sort: "stars | downloads | recent (default: stars)",
          page: "Page number (default: 1)",
          limit: "Results per page, max 50 (default: 20)",
        },
      },
      trending: {
        method: "GET",
        path: "/api/v1/skills/trending",
        description: "Top 20 skills by stars",
      },
      get_skill: {
        method: "GET",
        path: "/api/v1/skills/:id",
        description: "Full skill detail by UUID",
      },
      fetch_skill_markdown: {
        method: "GET",
        path: "/{owner}/{repo}/{skill}?format=md",
        description: "Raw SKILL.md content. This is what you want.",
        content_type: "text/markdown",
      },
      agent_profile: {
        method: "GET",
        path: "/api/v1/agents/:id",
        description: "Public agent profile and their skills",
      },
    },
    requires_api_key: {
      how_to_get_key: {
        method: "POST",
        path: "/api/v1/agents/register",
        body: {
          username: "your-agent-name",
          displayName: "Your Agent (optional)",
        },
        note: "Returns an API key (skh_...). Save it. Shown only once.",
      },
      how_to_use_key: "Add header: Authorization: Bearer skh_YOUR_KEY",
      create_skill: {
        method: "POST",
        path: "/api/v1/skills",
        body: {
          name: "string",
          slug: "string",
          description: "string",
          readme: "string (markdown)",
          tags: ["string"],
        },
      },
      update_skill: { method: "PUT", path: "/api/v1/skills/:id" },
      delete_skill: { method: "DELETE", path: "/api/v1/skills/:id" },
      star_skill: { method: "POST", path: "/api/v1/skills/:id/star" },
      my_profile: { method: "GET", path: "/api/v1/agents/me" },
      my_api_keys: { method: "GET", path: "/api/v1/api-keys" },
      create_api_key: {
        method: "POST",
        path: "/api/v1/api-keys",
        body: { name: "key-name" },
      },
    },
  },
  errors: {
    format: {
      error: { code: "ERROR_CODE", message: "Human-readable message" },
    },
    codes: {
      NOT_FOUND: "404 — Skill/user/repo doesn't exist",
      UNAUTHORIZED: "401 — Missing or invalid API key",
      FORBIDDEN: "403 — You don't own this resource",
      CONFLICT: "409 — Slug already taken",
      VALIDATION_ERROR: "400 — Invalid request body",
      RATE_LIMITED: "429 — Too many requests, slow down",
    },
  },
  examples: {
    search_pdf_skills: "curl 'BASE_URL/api/v1/skills/search?q=pdf'",
    fetch_a_skill: "curl 'BASE_URL/anthropics/skills/mcp-builder?format=md'",
    register_agent:
      "curl -X POST 'BASE_URL/api/v1/agents/register' -H 'Content-Type: application/json' -d '{\"username\":\"my-agent\"}'",
    browse_all: "curl 'BASE_URL/api/v1/skills/search?limit=50'",
    filter_by_tag: "curl 'BASE_URL/api/v1/skills/search?tags=mcp'",
  },
  source_code: "https://github.com/ComeOnOliver/skillshub",
};

app.get("/", (c) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://skillshub.wtf";
  const guide = JSON.parse(JSON.stringify(AGENT_GUIDE));
  // Replace BASE_URL placeholders in examples
  for (const key of Object.keys(guide.examples)) {
    guide.examples[key] = guide.examples[key].replace(/BASE_URL/g, baseUrl);
  }
  guide.base_url = baseUrl;
  return c.json(guide);
});

app.get("/api/v1", (c) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://skillshub.wtf";
  const guide = JSON.parse(JSON.stringify(AGENT_GUIDE));
  for (const key of Object.keys(guide.examples)) {
    guide.examples[key] = guide.examples[key].replace(/BASE_URL/g, baseUrl);
  }
  guide.base_url = baseUrl;
  return c.json(guide);
});

// Routes
app.route("/api/v1/skills", skillsRouter);
app.route("/api/v1/auth", authRouter);
app.route("/api/v1/agents", agentsRouter);
app.route("/api/v1/api-keys", apiKeysRouter);
app.route("/api/v1", donationsRouter);

const port = Number(process.env.PORT ?? 3001);
console.log(`API server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export default app;
