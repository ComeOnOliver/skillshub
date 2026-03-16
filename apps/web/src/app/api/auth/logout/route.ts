import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  session.destroy();
  await session.save();
  return Response.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
