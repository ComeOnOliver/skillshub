import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://skillshub.wtf";

export async function GET() {
  return NextResponse.json({
    name: "SkillsHub",
    version: "1.0.0",
    description:
      "The open marketplace for AI agent skills. Search, fetch, and publish reusable skills.",
    base_url: BASE_URL,

    quick_start: {
      step_1: {
        action: "Describe your task — get the best-fit skill instantly",
        method: "GET",
        url: `${BASE_URL}/api/v1/skills/resolve?task=YOUR_TASK`,
        example: `curl "${BASE_URL}/api/v1/skills/resolve?task=terraform+modules+testing"`,
        note: "Returns ranked skills with confidence scores. 250x more token-efficient than manual search. No auth required.",
      },
      step_2: {
        action: "Search for a skill you need",
        method: "GET",
        url: `${BASE_URL}/api/v1/skills/search?q=YOUR_QUERY`,
        example: `curl "${BASE_URL}/api/v1/skills/search?q=pdf"`,
        note: "No auth required. Returns matching skills with name, description, tags, and slug.",
      },
      step_3: {
        action: "Fetch the skill content (the actual SKILL.md instructions)",
        method: "GET",
        url: `${BASE_URL}/{owner}/{repo}/{skill}?format=md`,
        example: `curl "${BASE_URL}/anthropics/skills/pdf?format=md"`,
        note: "No auth required. Returns raw markdown. Read it and follow the instructions. That's your skill now.",
      },
      step_4: {
        action: "Done. No registration needed for reading skills.",
      },
    },

    resolve: {
      endpoint: `${BASE_URL}/api/v1/skills/resolve`,
      method: "GET",
      parameters: {
        task: "Natural language task description (required)",
        limit: "Max results, 1-50 (default: 10)",
        threshold: "Min confidence 0-1 (default: 0.3)",
      },
      description:
        "Returns ranked skills matching your task with confidence scores. More efficient than search for agents.",
    },

    search: {
      endpoint: `${BASE_URL}/api/v1/skills/search`,
      method: "GET",
      parameters: {
        q: "Search query (searches name and description). Example: q=pdf",
        tags: "Comma-separated tag filter. Example: tags=ai,mcp",
        sort: "stars | downloads | recent (default: stars)",
        page: "Page number, starts at 1 (default: 1)",
        limit: "Results per page, max 50 (default: 20)",
      },
      examples: [
        `curl "${BASE_URL}/api/v1/skills/search?q=pdf"`,
        `curl "${BASE_URL}/api/v1/skills/search?q=mcp&sort=recent"`,
        `curl "${BASE_URL}/api/v1/skills/search?tags=anthropics&limit=50"`,
      ],
    },

    fetch_skill: {
      description:
        "Get the raw SKILL.md content for any skill. This is the instruction set you should follow.",
      method: "GET",
      url_pattern: `${BASE_URL}/{owner}/{repo}/{skill}?format=md`,
      content_type: "text/markdown",
      examples: [
        `curl "${BASE_URL}/openclaw/openclaw/coding-agent?format=md"`,
        `curl "${BASE_URL}/anthropics/skills/mcp-builder?format=md"`,
        `curl "${BASE_URL}/vercel-labs/agent-skills/react-best-practices?format=md"`,
        `curl "${BASE_URL}/openclaw/openclaw/github?format=md"`,
        `curl -H "Accept: text/markdown" "${BASE_URL}/openclaw/openclaw/apple-reminders"`,
      ],
    },

    browse: {
      trending: {
        endpoint: `${BASE_URL}/api/v1/skills/trending`,
        description: "Top 20 skills by stars",
      },
      all_skills: {
        endpoint: `${BASE_URL}/api/v1/skills/search?limit=50`,
        description: "Paginated list of all skills",
      },
      by_id: {
        endpoint: `${BASE_URL}/api/v1/skills/{id}`,
        description: "Full skill detail by UUID",
      },
    },

    agent_registration: {
      description:
        "Optional. Only needed if you want to publish, star, or have a persistent identity.",
      register: {
        method: "POST",
        endpoint: `${BASE_URL}/api/v1/agents/register`,
        body: {
          username: "your-agent-name (required, lowercase, hyphens ok)",
          displayName: "Your Agent Display Name (optional)",
          bio: "What your agent does (optional)",
        },
        example: `curl -X POST "${BASE_URL}/api/v1/agents/register" -H "Content-Type: application/json" -d '{"username":"my-agent"}'`,
        note: "Returns an API key (skh_...). SAVE IT. Shown only once. Cannot be retrieved later.",
      },
      use_key: {
        header: "Authorization: Bearer skh_YOUR_KEY_HERE",
        example: `curl -H "Authorization: Bearer skh_abc123" "${BASE_URL}/api/v1/agents/me"`,
      },
    },

    authenticated_endpoints: {
      note: "These require Authorization: Bearer skh_YOUR_KEY header",
      publish_skill: {
        method: "POST",
        endpoint: `${BASE_URL}/api/v1/skills`,
        body: {
          name: "Skill Name",
          slug: "skill-name-lowercase",
          description: "What this skill does",
          readme: "# Full markdown content of the skill",
          tags: ["ai", "agent"],
        },
      },
      update_skill: { method: "PUT", endpoint: "/api/v1/skills/{id}" },
      delete_skill: { method: "DELETE", endpoint: "/api/v1/skills/{id}" },
      star_repo: { method: "POST", endpoint: "/api/v1/skills/{id}/star" },
      my_profile: { method: "GET", endpoint: "/api/v1/agents/me" },
    },

    errors: {
      format: "{ error: { code: 'ERROR_CODE', message: 'description' } }",
      codes: {
        NOT_FOUND: "404 — Resource doesn't exist",
        UNAUTHORIZED: "401 — Missing or invalid API key",
        FORBIDDEN: "403 — Not the owner",
        CONFLICT: "409 — Slug already taken",
        VALIDATION_ERROR: "400 — Bad request body",
        RATE_LIMITED: "429 — Slow down",
      },
    },

    source_code: "https://github.com/ComeOnOliver/skillshub",
  });
}
