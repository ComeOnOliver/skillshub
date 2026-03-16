import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { PublishForm } from "./publish-form";
import Link from "next/link";

export default async function PublishSkillPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 animate-fade-in">
      <h1 className="mb-2 font-mono text-2xl font-bold text-neutral-100">
        <span className="text-neon-cyan/60">$</span> publish --skill
      </h1>
      <p className="mb-8 font-mono text-sm text-neutral-500">
        Share your AI agent skill with the community.
      </p>

      {/* Import from GitHub CTA */}
      <Link
        href="/skills/import"
        className="mb-8 flex items-center gap-4 rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 p-5 transition-all hover:border-neon-cyan/40 hover:bg-neon-cyan/10 group"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neon-cyan/30 bg-neon-cyan/10 font-mono text-lg text-neon-cyan">
          ⇣
        </div>
        <div>
          <p className="font-mono text-sm font-medium text-neon-cyan group-hover:text-white transition-colors">
            $ import --from github
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">
            Scan a GitHub repo for skills and import them with one click.
            Supports private repos.
          </p>
        </div>
        <span className="ml-auto font-mono text-xs text-neutral-600 group-hover:text-neon-cyan transition-colors">
          →
        </span>
      </Link>

      {/* Divider */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-neutral-800" />
        <span className="font-mono text-xs text-neutral-600">
          or create manually
        </span>
        <div className="h-px flex-1 bg-neutral-800" />
      </div>

      <PublishForm />
    </div>
  );
}
