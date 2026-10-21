"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SwitchAccountButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function switchAccount() {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });

    if (signOutError) {
      setError("Could not sign out. Please try again.");
      setLoading(false);
      return;
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });

    if (oauthError) {
      setError("Could not open Google sign-in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <button className="text-link" type="button" onClick={switchAccount} disabled={loading}>
        {loading ? "Opening Google…" : "Try a different Google account →"}
      </button>
      {error && <p className="auth-error" role="alert">{error}</p>}
    </>
  );
}
