import { signOut } from "@/auth";
import { getSession } from "@/lib/session";

export async function POST() {
  // Clear legacy iron-session as well
  try {
    const session = await getSession();
    session.destroy();
    await session.save();
  } catch {
    // Ignore — legacy session may not exist
  }

  await signOut({ redirectTo: "/" });
}
