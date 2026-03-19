import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { skills, repos } from "@skillshub/db/schema";
import { eq } from "drizzle-orm";

// Force dynamic rendering — sitemap needs DB access at runtime, not build time
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getDb();

  let skillPages: MetadataRoute.Sitemap = [];
  try {
    const rows = await db
      .select({
        slug: skills.slug,
        githubOwner: repos.githubOwner,
        githubRepoName: repos.githubRepoName,
        updatedAt: skills.updatedAt,
      })
      .from(skills)
      .innerJoin(repos, eq(skills.repoId, repos.id))
      .where(eq(skills.isPublished, true));

    skillPages = rows.map((row) => ({
      url: `https://skillshub.wtf/${row.githubOwner}/${row.githubRepoName}/${row.slug}`,
      lastModified: row.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // DB unavailable (e.g., build time) — return static pages only
  }

  return [
    {
      url: "https://skillshub.wtf",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://skillshub.wtf/skills",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...skillPages,
  ];
}
