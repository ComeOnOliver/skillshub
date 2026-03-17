import "dotenv/config";
import { createDb } from "./client.js";
import { skills, repos } from "./schema.js";
import { eq, sql, and } from "drizzle-orm";

async function main() {
  const db = createDb();

  // The TerminalSkills repo has skills where descriptions mention many techs
  // but the skill is really about ONE specific tool. Fix by keeping only tags
  // that match the skill NAME (not description)

  const termSkills = await db.execute(sql`
    SELECT s.id, s.name, s.tags
    FROM skills s JOIN repos r ON s.repo_id = r.id
    WHERE r.github_owner = 'TerminalSkills'
    OR r.github_owner = 'ynulihao'
    OR r.github_owner = 'rmyndharis'
  `);

  console.log(`Processing ${termSkills.rows.length} skills from broad-tag repos...`);
  let fixed = 0;

  for (const skill of termSkills.rows as any[]) {
    const name = (skill.name as string).toLowerCase();
    const oldTags = skill.tags as string[];
    if (!oldTags || oldTags.length === 0) continue;

    // Only keep tags where the tag keyword appears in the SKILL NAME
    const newTags = oldTags.filter(tag => {
      // Always keep generic tags
      if (['coding', 'writing', 'design', 'agent', 'ai', 'data', 'backend', 'frontend', 'devops', 'security', 'testing'].includes(tag)) return true;
      // For specific tech tags, check if in the name
      return name.includes(tag) || 
        (tag === 'react' && name.includes('react')) ||
        (tag === 'docker' && (name.includes('docker') || name.includes('container'))) ||
        (tag === 'ios' && (name.includes('ios') || name.includes('swift') || name.includes('apple'))) ||
        (tag === 'android' && (name.includes('android') || name.includes('kotlin'))) ||
        (tag === 'python' && (name.includes('python') || name.includes('django') || name.includes('flask') || name.includes('pandas'))) ||
        (tag === 'kubernetes' && (name.includes('kubernetes') || name.includes('k8s') || name.includes('helm'))) ||
        (tag === 'terraform' && name.includes('terraform')) ||
        (tag === 'aws' && (name.includes('aws') || name.includes('amazon'))) ||
        (tag === 'azure' && name.includes('azure')) ||
        (tag === 'rust' && name.includes('rust')) ||
        (tag === 'swift' && (name.includes('swift') || name.includes('xcode'))) ||
        (tag === 'mobile' && (name.includes('mobile') || name.includes('ios') || name.includes('android') || name.includes('react-native') || name.includes('flutter') || name.includes('expo'))) ||
        (tag === 'e2e' && (name.includes('playwright') || name.includes('cypress') || name.includes('e2e')));
    });

    if (newTags.length < oldTags.length) {
      await db.update(skills).set({ tags: newTags }).where(eq(skills.id, skill.id));
      fixed++;
    }
  }

  console.log(`Fixed ${fixed} skills`);

  // Final counts
  for (const tag of ['docker', 'ios', 'react', 'python', 'mobile', 'android', 'kubernetes']) {
    const [r] = (await db.execute(sql`SELECT count(*)::int as cnt FROM skills WHERE ${sql.raw("'" + tag + "'")} = ANY(tags)`)).rows as any[];
    console.log(`  ${tag}: ${r.cnt} skills`);
  }

  process.exit(0);
}
main();
