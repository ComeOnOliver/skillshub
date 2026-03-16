"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface GitHubRepo {
  fullName: string;
  owner: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  stars: number;
  language: string | null;
  updatedAt: string;
}

interface DiscoveredSkill {
  dirName: string;
  name: string;
  description: string;
  readme: string;
  tags: string[];
  hasSkillMd: boolean;
  selected: boolean;
}

interface RepoInfo {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  isPrivate: boolean;
  stars: number;
  defaultBranch: string;
}

type Step = "select" | "scan" | "import" | "done";

export function ImportForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("select");
  const [repoUrl, setRepoUrl] = useState("");
  const [userRepos, setUserRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [repoFilter, setRepoFilter] = useState("");

  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [skills, setSkills] = useState<DiscoveredSkill[]>([]);

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  // Load user repos on mount
  useEffect(() => {
    fetchUserRepos();
  }, []);

  async function fetchUserRepos() {
    setLoadingRepos(true);
    try {
      const res = await fetch("/api/github/repos");
      if (res.ok) {
        const data = await res.json();
        setUserRepos(data.data || []);
      }
    } catch {
      // Silent fail — user can still paste URL
    } finally {
      setLoadingRepos(false);
    }
  }

  function parseRepoUrl(url: string): { owner: string; repo: string } | null {
    // Handle full URLs
    const urlMatch = url.match(
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/\s?#]+)/
    );
    if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, "") };

    // Handle owner/repo format
    const shortMatch = url.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] };

    return null;
  }

  async function handleScan() {
    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      setScanError("Invalid repo URL. Use https://github.com/owner/repo or owner/repo format.");
      return;
    }

    setScanning(true);
    setScanError(null);
    setStep("scan");

    try {
      const res = await fetch("/api/github/scan-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();

      if (!res.ok) {
        setScanError(data.error?.message ?? "Failed to scan repository");
        setStep("select");
        return;
      }

      setRepoInfo(data.data.repo);
      setSkills(
        data.data.skills.map((s: any) => ({ ...s, selected: true }))
      );
    } catch (err: any) {
      setScanError(err.message || "Network error");
      setStep("select");
    } finally {
      setScanning(false);
    }
  }

  function toggleSkill(index: number) {
    setSkills((prev) =>
      prev.map((s, i) => (i === index ? { ...s, selected: !s.selected } : s))
    );
  }

  function toggleAll() {
    const allSelected = skills.every((s) => s.selected);
    setSkills((prev) => prev.map((s) => ({ ...s, selected: !allSelected })));
  }

  async function handleImport() {
    if (!repoInfo) return;
    const selectedSkills = skills.filter((s) => s.selected);
    if (selectedSkills.length === 0) return;

    setImporting(true);
    setImportError(null);
    setStep("import");

    try {
      const res = await fetch("/api/github/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: repoInfo.owner,
          repo: repoInfo.name,
          repoDescription: repoInfo.description,
          repoUrl: `https://github.com/${repoInfo.fullName}`,
          stars: repoInfo.stars,
          isPrivate: repoInfo.isPrivate,
          skills: selectedSkills.map((s) => ({
            dirName: s.dirName,
            name: s.name,
            description: s.description,
            readme: s.readme,
            tags: s.tags,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setImportError(data.error?.message ?? "Failed to import skills");
        setStep("scan");
        return;
      }

      setImportResult(data.data);
      setStep("done");
    } catch (err: any) {
      setImportError(err.message || "Network error");
      setStep("scan");
    } finally {
      setImporting(false);
    }
  }

  const selectedCount = skills.filter((s) => s.selected).length;
  const filteredRepos = userRepos.filter(
    (r) =>
      r.fullName.toLowerCase().includes(repoFilter.toLowerCase()) ||
      r.description?.toLowerCase().includes(repoFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Step 1: Repo Selection */}
      {(step === "select" || step === "scan") && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-6">
          <div className="mb-4 font-mono text-xs text-neutral-600">
            <span className="text-neon-cyan">step_1</span> // select repository
          </div>

          {/* URL Input */}
          <div className="mb-4">
            <label className="mb-1.5 block font-mono text-xs text-neutral-400">
              repo_url
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setScanError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                placeholder="https://github.com/owner/repo or owner/repo"
                className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-neon-cyan/50 transition-colors placeholder:text-neutral-600"
              />
              <button
                onClick={handleScan}
                disabled={!repoUrl.trim() || scanning}
                className="rounded-md border border-neon-cyan/40 bg-neon-cyan/5 px-6 py-2.5 font-mono text-sm text-neon-cyan hover:bg-neon-cyan/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {scanning ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan" />
                    scanning...
                  </span>
                ) : (
                  "$ scan"
                )}
              </button>
            </div>
          </div>

          {/* Repo Dropdown */}
          <div className="mb-2">
            <button
              onClick={() => setShowRepoDropdown(!showRepoDropdown)}
              className="font-mono text-xs text-neutral-500 hover:text-neon-cyan transition-colors"
            >
              {showRepoDropdown ? "▾" : "▸"} or select from your repos
              {loadingRepos && " (loading...)"}
            </button>
          </div>

          {showRepoDropdown && (
            <div className="rounded-md border border-neutral-800 bg-neutral-900/80">
              <div className="border-b border-neutral-800 p-2">
                <input
                  type="text"
                  value={repoFilter}
                  onChange={(e) => setRepoFilter(e.target.value)}
                  placeholder="Filter repos..."
                  className="w-full bg-transparent px-2 py-1 font-mono text-xs text-white outline-none placeholder:text-neutral-600"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredRepos.length === 0 ? (
                  <div className="p-4 text-center font-mono text-xs text-neutral-600">
                    {loadingRepos ? "Loading repos..." : "No repos found"}
                  </div>
                ) : (
                  filteredRepos.map((repo) => (
                    <button
                      key={repo.fullName}
                      onClick={() => {
                        setRepoUrl(repo.fullName);
                        setShowRepoDropdown(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-800/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-neutral-200 truncate">
                            {repo.fullName}
                          </span>
                          {repo.isPrivate && (
                            <span className="rounded border border-yellow-600/30 bg-yellow-600/10 px-1.5 py-0.5 font-mono text-[10px] text-yellow-500">
                              private
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="mt-0.5 text-xs text-neutral-600 truncate">
                            {repo.description}
                          </p>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-neutral-600 shrink-0">
                        ⭐ {repo.stars}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {scanError && (
            <div className="mt-4 rounded-md border border-red-800/50 bg-red-900/10 p-3 font-mono text-xs text-red-400">
              <span className="text-red-600">error:</span> {scanError}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Skill Discovery */}
      {step === "scan" && !scanning && skills.length > 0 && repoInfo && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-6">
          <div className="mb-4 font-mono text-xs text-neutral-600">
            <span className="text-neon-cyan">step_2</span> // select skills to
            import
          </div>

          {/* Repo Info */}
          <div className="mb-4 rounded-md border border-neutral-800 bg-neutral-900/50 p-4">
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-neutral-500">&gt;</span>
              <span className="text-neon-cyan">Found {skills.length} skills</span>
              <span className="text-neutral-600">in</span>
              <span className="text-neutral-300">{repoInfo.fullName}</span>
              <span className="text-neutral-700">/skills/</span>
            </div>
            {repoInfo.isPrivate && (
              <div className="mt-1 font-mono text-[10px] text-yellow-500">
                🔒 private repository
              </div>
            )}
          </div>

          {/* Select All / Count */}
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={toggleAll}
              className="font-mono text-xs text-neutral-500 hover:text-neon-cyan transition-colors"
            >
              {skills.every((s) => s.selected) ? "☑ deselect all" : "☐ select all"}
            </button>
            <span className="font-mono text-xs text-neutral-600">
              {selectedCount}/{skills.length} selected
            </span>
          </div>

          {/* Skills List */}
          <div className="max-h-[500px] space-y-1 overflow-y-auto">
            {skills.map((skill, i) => (
              <button
                key={skill.dirName}
                onClick={() => toggleSkill(i)}
                className={`flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition-all ${
                  skill.selected
                    ? "border-neon-cyan/20 bg-neon-cyan/5"
                    : "border-neutral-800/50 bg-transparent hover:border-neutral-700"
                }`}
              >
                <span className="mt-0.5 font-mono text-sm shrink-0">
                  {skill.selected ? (
                    <span className="text-neon-cyan">☑</span>
                  ) : (
                    <span className="text-neutral-600">☐</span>
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-neutral-200">
                      {skill.name}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-700">
                      /{skill.dirName}
                    </span>
                  </div>
                  {skill.description && (
                    <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                      {skill.description}
                    </p>
                  )}
                  {skill.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {skill.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="rounded border border-neutral-800 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Import Button */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => {
                setStep("select");
                setSkills([]);
                setRepoInfo(null);
              }}
              className="font-mono text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              ← back
            </button>
            <button
              onClick={handleImport}
              disabled={selectedCount === 0 || importing}
              className="rounded-md border border-neon-cyan/40 bg-neon-cyan/10 px-8 py-2.5 font-mono text-sm text-neon-cyan hover:bg-neon-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {importing ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan" />
                  importing {selectedCount} skills...
                </span>
              ) : (
                `$ import --count ${selectedCount}`
              )}
            </button>
          </div>

          {importError && (
            <div className="mt-4 rounded-md border border-red-800/50 bg-red-900/10 p-3 font-mono text-xs text-red-400">
              <span className="text-red-600">error:</span> {importError}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Import Progress / Done */}
      {step === "import" && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-6">
          <div className="flex items-center gap-3 font-mono text-sm text-neutral-400">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan" />
            Importing skills...
          </div>
        </div>
      )}

      {step === "done" && importResult && (
        <div className="rounded-lg border border-green-800/30 bg-green-900/10 p-6">
          <div className="mb-4 font-mono text-xs text-neutral-600">
            <span className="text-green-400">done</span> // import complete
          </div>

          <div className="mb-4 space-y-1 font-mono text-sm">
            <div className="text-green-400">
              ✓ {importResult.created} skills created
            </div>
            {importResult.updated > 0 && (
              <div className="text-yellow-400">
                ↻ {importResult.updated} skills updated
              </div>
            )}
            {importResult.errors > 0 && (
              <div className="text-red-400">
                ✗ {importResult.errors} errors
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                router.push(`/${importResult.owner}/${importResult.repo}`)
              }
              className="rounded-md border border-neon-cyan/40 bg-neon-cyan/10 px-6 py-2.5 font-mono text-sm text-neon-cyan hover:bg-neon-cyan/20 transition-all"
            >
              $ cd /{importResult.owner}/{importResult.repo}
            </button>
            <button
              onClick={() => {
                setStep("select");
                setSkills([]);
                setRepoInfo(null);
                setImportResult(null);
                setRepoUrl("");
              }}
              className="rounded-md border border-neutral-700 px-6 py-2.5 font-mono text-sm text-neutral-400 hover:bg-neutral-800 transition-all"
            >
              import another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
