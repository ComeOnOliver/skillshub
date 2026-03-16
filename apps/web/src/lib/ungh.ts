interface UnghRepo {
  stars: number;
  forks: number;
  description: string;
  defaultBranch: string;
}

const CACHE_REVALIDATE = 3600; // 1 hour

export async function getRepoStars(owner: string, repo: string): Promise<number> {
  try {
    const res = await fetch(`https://ungh.cc/repos/${owner}/${repo}`, {
      next: { revalidate: CACHE_REVALIDATE },
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.repo?.stars ?? 0;
  } catch {
    return 0;
  }
}

// Batch fetch for multiple repos at once (used on landing/browse pages)
export async function getMultiRepoStars(
  repos: Array<{ owner: string; repo: string }>
): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  const fetches = repos.map(async ({ owner, repo }) => {
    const stars = await getRepoStars(owner, repo);
    results.set(`${owner}/${repo}`, stars);
  });
  await Promise.all(fetches);
  return results;
}
