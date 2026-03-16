import matter from "gray-matter";

// ── Types ──────────────────────────────────────────────────────────────────

export interface RepoInfo {
  fullName: string;
  owner: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  stars: number;
  language: string | null;
  updatedAt: string;
}

export interface DiscoveredSkill {
  dirName: string;
  slug: string;
  name: string;
  description: string;
  readme: string;
  tags: string[];
  hasSkillMd: boolean;
}

export interface RepoMetadata {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  isPrivate: boolean;
  stars: number;
  defaultBranch: string;
}

export interface ScanResult {
  repo: RepoMetadata;
  skills: DiscoveredSkill[];
  total: number;
  warning?: string;
}

interface GitHubTreeItem {
  path: string;
  type: string;
  sha: string;
  size?: number;
}

interface GitHubTreeResponse {
  sha: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

interface GitHubRepoResponse {
  full_name: string;
  description: string | null;
  private: boolean;
  stargazers_count: number;
  default_branch: string;
  owner: { login: string };
  name: string;
  language: string | null;
  updated_at: string;
}

// ── Error ──────────────────────────────────────────────────────────────────

export class GitHubApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function githubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };
}

async function githubFetch<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { headers: githubHeaders(token) });

  if (res.status === 401) {
    throw new GitHubApiError(401, "TOKEN_REVOKED", "GitHub access expired. Please log in again.");
  }

  if (res.status === 404) {
    throw new GitHubApiError(404, "NOT_FOUND", "Resource not found on GitHub.");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GitHubApiError(res.status, "GITHUB_ERROR", `GitHub API returned ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

function generateSlug(dirName: string): string {
  const slug = dirName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug.length === 0 ? "unnamed-skill" : slug;
}

// ── Service Functions ──────────────────────────────────────────────────────

/**
 * List the authenticated user's repositories (up to 300).
 */
export async function listUserRepos(token: string): Promise<RepoInfo[]> {
  const repos: RepoInfo[] = [];
  const perPage = 100;

  for (let page = 1; page <= 3; page++) {
    const data = await githubFetch<GitHubRepoResponse[]>(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner,organization_member`,
      token
    );

    for (const r of data) {
      repos.push({
        fullName: r.full_name,
        owner: r.owner.login,
        name: r.name,
        description: r.description,
        isPrivate: r.private,
        stars: r.stargazers_count,
        language: r.language,
        updatedAt: r.updated_at,
      });
    }

    if (data.length < perPage) break;
  }

  return repos;
}

/**
 * Scan a repository for skills (SKILL.md files under skills/ directory).
 */
export async function scanRepoForSkills(
  token: string,
  owner: string,
  repo: string
): Promise<ScanResult> {
  // Step 1: Get repo metadata + default branch
  const repoData = await githubFetch<GitHubRepoResponse>(
    `https://api.github.com/repos/${owner}/${repo}`,
    token
  );
  const defaultBranch = repoData.default_branch || "main";

  // Step 2: Fetch entire tree recursively
  const treeData = await githubFetch<GitHubTreeResponse>(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    token
  );

  // Fix 7: Truncated tree detection
  const warning = treeData.truncated
    ? "Repository is very large. Some skills may not be detected."
    : undefined;

  // Step 3: Find all SKILL.md files — check multiple patterns
  const skillMdPaths: string[] = [];

  // Pattern 1: skills/*/SKILL.md (standard — e.g. openclaw/openclaw)
  for (const item of treeData.tree || []) {
    if (item.type === "blob" && /^skills\/[^/]+\/SKILL\.md$/.test(item.path)) {
      skillMdPaths.push(item.path);
    }
  }

  // Pattern 2: */SKILL.md at root level (for repos that ARE skill collections — e.g. openai/skills)
  if (skillMdPaths.length === 0) {
    for (const item of treeData.tree || []) {
      if (item.type === "blob" && /^[^/]+\/SKILL\.md$/.test(item.path)) {
        skillMdPaths.push(item.path);
      }
    }
  }

  // Pattern 3: SKILL.md at root (single-skill repo)
  if (skillMdPaths.length === 0) {
    for (const item of treeData.tree || []) {
      if (item.type === "blob" && item.path === "SKILL.md") {
        skillMdPaths.push(item.path);
      }
    }
  }

  if (skillMdPaths.length === 0) {
    throw new GitHubApiError(
      404,
      "NO_SKILLS",
      `No skills found in ${owner}/${repo}. Looked for: skills/*/SKILL.md, */SKILL.md, or SKILL.md at root.`
    );
  }

  // Step 4: Fetch SKILL.md content for each skill (parallel, batched)
  const skills: DiscoveredSkill[] = [];
  const batchSize = 10;

  for (let i = 0; i < skillMdPaths.length; i += batchSize) {
    const batch = skillMdPaths.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (path) => {
        const content = await fetchFileContent(token, owner, repo, path);
        // Extract dir name: "skills/foo/SKILL.md" → "foo", "foo/SKILL.md" → "foo", "SKILL.md" → repo name
        const parts = path.split("/");
        const dirName = parts.length >= 3 ? parts[parts.length - 2] : parts.length === 2 ? parts[0] : repo;
        const { data: frontmatter, content: body } = matter(content);

        const name = (frontmatter.name as string) || dirName;
        const description = (frontmatter.description as string) || "";
        const tags: string[] = Array.isArray(frontmatter.tags)
          ? frontmatter.tags.map(String)
          : [];

        return {
          dirName,
          slug: generateSlug(dirName),
          name,
          description,
          readme: body.trim(),
          tags,
          hasSkillMd: true,
        } satisfies DiscoveredSkill;
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        skills.push(result.value);
      }
    }
  }

  // Sort alphabetically
  skills.sort((a, b) => a.name.localeCompare(b.name));

  return {
    repo: {
      owner,
      name: repo,
      fullName: repoData.full_name,
      description: repoData.description,
      isPrivate: repoData.private,
      stars: repoData.stargazers_count,
      defaultBranch,
    },
    skills,
    total: skills.length,
    warning,
  };
}

/**
 * Fetch a single file's content from a GitHub repo (base64-decoded).
 */
export async function fetchFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  const data = await githubFetch<{ content: string; encoding: string }>(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    token
  );
  return Buffer.from(data.content, "base64").toString("utf-8");
}
