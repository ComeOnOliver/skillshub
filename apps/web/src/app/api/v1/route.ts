import { corsJson, OPTIONS as corsOptions } from "@/lib/api-cors";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://skillshub.wtf";

export async function GET() {
  return corsJson({
    name: "SkillsHub",
    version: "1.0.0",
    description:
      "The open marketplace for AI agent skills. Search, fetch, and publish reusable skills.",
    base_url: BASE_URL,

    quick_start: {
      step_1: {
        action: "Search for a skill you need",
        method: "GET",
        url: `${BASE_URL}/api/v1/skills/search?q=YOUR_QUERY`,
        example: `curl "${BASE_URL}/api/v1/skills/search?q=pdf"`,
        note: "No auth required. Returns matching skills with name, description, tags, and slug.",
      },
      step_2: {
        action: "Fetch the skill content (the actual SKILL.md instructions)",
        method: "GET",
        url: `${BASE_URL}/{owner}/{repo}/{skill}?format=md`,
        example: `curl "${BASE_URL}/anthropics/skills/pdf?format=md"`,
        note: "No auth required. Returns raw markdown. Read it and follow the instructions. That's your skill now.",
      },
      step_3: {
        action: "Done. No registration needed for reading skills.",
      },
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
    },

    fetch_skill: {
      description:
        "Get the raw SKILL.md content for any skill. This is the instruction set you should follow.",
      method: "GET",
      url_pattern: `${BASE_URL}/{owner}/{repo}/{skill}?format=md`,
      content_type: "text/markdown",
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
        note: "Returns an API key (skh_...). SAVE IT. Shown only once.",
      },
      use_key: {
        header: "Authorization: Bearer skh_YOUR_KEY_HERE",
      },
    },

    authenticated_endpoints: {
      note: "These require Authorization: Bearer skh_YOUR_KEY header",
      publish_skill: {
        method: "POST",
        endpoint: `${BASE_URL}/api/v1/skills`,
      },
      update_skill: { method: "PUT", endpoint: "/api/v1/skills/{id}" },
      delete_skill: { method: "DELETE", endpoint: "/api/v1/skills/{id}" },
      star_skill: { method: "POST", endpoint: "/api/v1/skills/{id}/star" },
      my_profile: { method: "GET", endpoint: "/api/v1/agents/me" },
      api_keys: {
        list: { method: "GET", endpoint: "/api/v1/api-keys" },
        create: { method: "POST", endpoint: "/api/v1/api-keys" },
        revoke: { method: "DELETE", endpoint: "/api/v1/api-keys/{id}" },
      },
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

export { corsOptions as OPTIONS };
