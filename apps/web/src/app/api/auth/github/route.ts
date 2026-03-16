import { GitHub, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET() {
  const github = new GitHub(
    process.env.GITHUB_CLIENT_ID ?? "",
    process.env.GITHUB_CLIENT_SECRET ?? "",
    process.env.GITHUB_REDIRECT_URI ?? "http://localhost:3000/callback"
  );

  const state = generateState();

  // OAuth scopes:
  // - "user:email": access user's email address
  // - "repo": full access to public and private repos (needed for private repo import)
  //
  // NOTE: For a public-only MVP, "public_repo,read:user" would suffice.
  // We use "repo" because users explicitly need to import private repos.
  // The consent screen on the login page should clearly explain what permissions
  // are being requested. Consider offering a "public repos only" option in the future
  // that uses reduced scopes (premium/opt-in for private repo access).
  const scopes = ["user:email", "repo"];

  const url = github.createAuthorizationURL(state, scopes);

  const cookieStore = await cookies();
  cookieStore.set("github_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });

  return Response.redirect(url.toString());
}
