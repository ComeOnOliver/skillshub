import { getDb } from "@/lib/db";
import { skills, users } from "@skillshub/db/schema";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";

interface Props {
  params: Promise<{ owner: string }>;
}

export default async function SkillByIdPage({ params }: Props) {
  const { owner: id } = await params;

  // UUID format check — only handle UUID redirects here
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    notFound();
  }

  const db = getDb();
  const [skill] = await db
    .select({
      slug: skills.slug,
      ownerUsername: users.username,
    })
    .from(skills)
    .innerJoin(users, eq(skills.ownerId, users.id))
    .where(eq(skills.id, id))
    .limit(1);

  if (!skill) notFound();

  redirect(`/skills/${skill.ownerUsername}/${skill.slug}`);
}
