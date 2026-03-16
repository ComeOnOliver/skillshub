import { GitHub } from "arctic";

export function createGitHub() {
  return new GitHub(
    process.env.GITHUB_CLIENT_ID ?? "",
    process.env.GITHUB_CLIENT_SECRET ?? "",
    process.env.GITHUB_REDIRECT_URI ?? "http://localhost:3000/callback"
  );
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  bio: string | null;
}

export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }
  return res.json();
}
