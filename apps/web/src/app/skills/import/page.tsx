import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { ImportForm } from "./import-form";

export default async function ImportSkillsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-mono text-2xl font-bold text-neutral-100">
          <span className="text-neon-cyan/60">$</span> import --skills
        </h1>
        <p className="mt-2 font-mono text-sm text-neutral-500">
          Scan a GitHub repository for skills and import them to SkillsHub.
        </p>
      </div>
      <ImportForm />
    </div>
  );
}
