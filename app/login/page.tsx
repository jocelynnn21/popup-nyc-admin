"use client";

import { useState } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="login-proof"><ShieldCheck size={16} /> Superadmin access only</div>
        <p className="kicker">POPUP.NYC / OPERATIONS</p>
        <h1>The city desk is<br />off the public grid.</h1>
        <p className="login-copy">
          Sign in with Google. Your identity is then checked against the protected
          <code> profiles.is_superadmin</code> field before any data is returned.
        </p>
        <button className="signal-button login-button" onClick={signIn} disabled={loading}>
          {loading ? "Opening Google…" : "Continue with Google"}<ArrowUpRight size={17} />
        </button>
        <p className="login-foot">Authentication proves who you are. The database flag decides what you may see.</p>
      </section>
      <aside className="login-aside" aria-hidden="true">
        <span>40.7128° N</span><span>74.0060° W</span>
        <strong>CONTROL<br />ROOM</strong>
      </aside>
    </main>
  );
}
