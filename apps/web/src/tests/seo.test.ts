import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

// Mock @/lib/db before any import that calls getDb()
vi.mock("@/lib/db", () => {
  const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([
      {
        slug: "hello-world",
        githubOwner: "alice",
        githubRepoName: "my-skills",
        updatedAt: new Date("2024-01-01"),
      },
      {
        slug: "data-pipeline",
        githubOwner: "bob",
        githubRepoName: "agent-tools",
        updatedAt: new Date("2024-02-01"),
      },
    ]),
  };
  return { getDb: () => mockDb };
});

const ROBOTS_PATH = join(__dirname, "../../public/robots.txt");

describe("robots.txt", () => {
  it("allows all crawlers", () => {
    const content = readFileSync(ROBOTS_PATH, "utf-8");
    expect(content).toContain("User-agent: *");
    expect(content).toContain("Allow: /");
  });

  it("references the sitemap URL", () => {
    const content = readFileSync(ROBOTS_PATH, "utf-8");
    expect(content).toContain("Sitemap:");
    expect(content).toMatch(/sitemap\.xml/);
  });
});

describe("sitemap", () => {
  it("contains the expected number of URLs (2 static + DB skills)", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    // 2 static pages (home + /skills) + 2 skill pages from the mock
    expect(entries).toHaveLength(4);
  });

  it("always includes the home page", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://skillshub.wtf");
  });

  it("always includes the /skills page", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://skillshub.wtf/skills");
  });

  it("includes skill pages fetched from the database", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://skillshub.wtf/alice/my-skills/hello-world");
    expect(urls).toContain("https://skillshub.wtf/bob/agent-tools/data-pipeline");
  });
});
