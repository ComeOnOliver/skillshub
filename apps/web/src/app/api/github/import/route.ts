import { getUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { skills, repos } from "@skillshub/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Fix 4: Input validation with regex for GitHub names
const githubNameRegex = /^[a-zA-Z0-9._-]+$/;

const importSkillSchema = z.object({
  dirName: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  readme: z.string().max(50000).optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

const importSchema = z.object({
  owner: z
    .string()
    .min(1)
    .max(100)
    .regex(githubNameRegex, "Invalid GitHub owner name"),
  repo: z
    .string()
    .min(1)
    .max(100)
    .regex(githubNameRegex, "Invalid GitHub repo name"),
  repoDescription: z.string().max(500).optional(),
  repoUrl: z.string().url().optional(),
  stars: z.number().int().min(0).optional(),
  isPrivate: z.boolean().optional(),
  skills: z.array(importSkillSchema).min(1).max(100),
});

// Rec 3: Proper types for import results
interface ImportedSkill {
  id: string;
  slug: string;
  name: string;
}

interface ImportResult {
  repoId: string;
  owner: string;
  repo: string;
  created: number;
  updated: number;
  errors: number;
  errorDetails: Array<{ dirName: string; error: string }>;
  skills: ImportedSkill[];
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Login required" } },
      { status: 401 }
    );
  }

  // Fix 9: Rate limiting — max 5 imports per hour
  const rateLimitMsg = checkRateLimit(`import:${user.userId}`, 5);
  if (rateLimitMsg) {
    return Response.json(
      { error: { code: "RATE_LIMITED", message: rateLimitMsg } },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { owner, repo, repoDescription, repoUrl, stars, skills: skillsData } = parsed.data;

  const db = getDb();

  try {
    // Fix 3: Wrap entire import in a transaction
    const result = await db.transaction(async (tx) => {
      // Find or create repo
      let [existingRepo] = await tx
        .select({ id: repos.id })
        .from(repos)
        .where(
          and(eq(repos.githubOwner, owner), eq(repos.githubRepoName, repo))
        )
        .limit(1);

      let repoId: string;

      if (existingRepo) {
        repoId = existingRepo.id;
        await tx
          .update(repos)
          .set({
            description: repoDescription ?? undefined,
            githubRepoUrl: repoUrl ?? `https://github.com/${owner}/${repo}`,
            starCount: stars ?? 0,
            updatedAt: new Date(),
          })
          .where(eq(repos.id, repoId));
      } else {
        const [newRepo] = await tx
          .insert(repos)
          .values({
            ownerId: user.userId,
            name: repo,
            displayName: repo,
            description: repoDescription ?? `Skills from ${owner}/${repo}`,
            githubRepoUrl: repoUrl ?? `https://github.com/${owner}/${repo}`,
            githubOwner: owner,
            githubRepoName: repo,
            starCount: stars ?? 0,
          })
          .returning({ id: repos.id });
        repoId = newRepo.id;
      }

      // Fix 10: Batch DB operations
      // Prepare all skill values with slugs
      const now = new Date();
      const created: ImportedSkill[] = [];
      const updated: ImportedSkill[] = [];
      const errors: Array<{ dirName: string; error: string }> = [];

      // First, check which skills already exist
      const slugMap = new Map<string, typeof skillsData[number]>();
      for (const s of skillsData) {
        // Fix 6: Empty slug guard
        let slug = s.dirName
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        if (slug.length === 0) slug = "unnamed-skill";
        slugMap.set(slug, s);
      }

      // Get existing skills for this repo
      const existingSkills = await tx
        .select({ id: skills.id, slug: skills.slug })
        .from(skills)
        .where(eq(skills.repoId, repoId));

      const existingSlugMap = new Map(existingSkills.map((s) => [s.slug, s.id]));

      // Separate into creates and updates
      const toCreate: Array<{
        ownerId: string;
        repoId: string;
        slug: string;
        name: string;
        description: string | undefined;
        readme: string | undefined;
        tags: string[];
        isPublished: boolean;
        importedAt: Date;
        source: "github_import";
      }> = [];

      const toUpdate: Array<{
        id: string;
        slug: string;
        name: string;
        description: string | undefined;
        readme: string | undefined;
        tags: string[];
      }> = [];

      for (const [slug, skillData] of slugMap) {
        const existingId = existingSlugMap.get(slug);
        if (existingId) {
          toUpdate.push({
            id: existingId,
            slug,
            name: skillData.name,
            description: skillData.description,
            readme: skillData.readme,
            tags: skillData.tags,
          });
        } else {
          toCreate.push({
            ownerId: user.userId,
            repoId,
            slug,
            name: skillData.name,
            description: skillData.description,
            readme: skillData.readme,
            tags: skillData.tags,
            isPublished: true,
            importedAt: now,
            source: "github_import",
          });
        }
      }

      // Batch insert new skills
      if (toCreate.length > 0) {
        const createdSkills = await tx
          .insert(skills)
          .values(toCreate)
          .returning({ id: skills.id, slug: skills.slug, name: skills.name });

        for (const s of createdSkills) {
          created.push({ id: s.id, slug: s.slug, name: s.name });
        }
      }

      // Batch update existing skills (Drizzle doesn't support multi-row update, so loop but within tx)
      for (const s of toUpdate) {
        try {
          await tx
            .update(skills)
            .set({
              name: s.name,
              description: s.description,
              readme: s.readme,
              tags: s.tags,
              importedAt: now,
              source: "github_import",
              updatedAt: now,
            })
            .where(eq(skills.id, s.id));

          updated.push({ id: s.id, slug: s.slug, name: s.name });
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          errors.push({ dirName: s.slug, error: errMsg });
        }
      }

      // Rec 2: Audit logging
      console.log(
        `[IMPORT] user=${user.userId} repo=${owner}/${repo} created=${created.length} updated=${updated.length} errors=${errors.length}`
      );

      return {
        repoId,
        owner,
        repo,
        created: created.length,
        updated: updated.length,
        errors: errors.length,
        errorDetails: errors,
        skills: [...created, ...updated],
      } satisfies ImportResult;
    });

    return Response.json({ data: result });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Failed to import skills";
    console.error("Import error:", error);
    return Response.json(
      { error: { code: "IMPORT_ERROR", message: errMsg } },
      { status: 500 }
    );
  }
}
