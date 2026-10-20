import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function UnauthorizedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <main className="center-state">
      <p className="kicker">403 / AUTHORIZED IDENTITY, INSUFFICIENT ROLE</p>
      <h1>You&apos;re signed in,<br />but not on the desk.</h1>
      <p>{user?.email ?? "This account"} does not have the superadmin database flag.</p>
      <Link className="text-link" href="/login">Try a different Google account →</Link>
    </main>
  );
}
