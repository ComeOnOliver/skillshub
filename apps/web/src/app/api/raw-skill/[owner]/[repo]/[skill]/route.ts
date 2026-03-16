import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { skills, repos } from "@skillshub/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string; skill: string }> }
) {
  const { owner, repo, skill } = await params;
  const db = getDb();

  const [row] = await db
    .select({ readme: skills.readme })
    .from(skills)
    .innerJoin(repos, eq(skills.repoId, repos.id))
    .where(
      and(
        eq(repos.githubOwner, owner),
        eq(repos.githubRepoName, repo),
        eq(skills.slug, skill)
      )
    )
    .limit(1);

  if (!row || !row.readme) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Increment download count on the repo (fire and forget)
  db.update(repos)
    .set({ downloadCount: sql`${repos.downloadCount} + 1` })
    .where(
      and(
        eq(repos.githubOwner, owner),
        eq(repos.githubRepoName, repo)
      )
    )
    .execute()
    .catch(() => {});

  return new NextResponse(row.readme, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
