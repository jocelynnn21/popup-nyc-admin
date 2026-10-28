"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Overview" },
  { href: "/generation", label: "Generation" },
  { href: "/prompts", label: "Prompts" },
  { href: "/models", label: "Models" },
  { href: "/access", label: "Access" },
  { href: "/ratings", label: "Ratings" },
];

export function Sidebar({ user }: { user: { email: string; name: string } }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="topbar">
      <Link className="admin-mark" href="/" aria-label="POPUP.NYC control room">
        <strong>POPUP.NYC</strong><small>Admin</small>
      </Link>
      <nav aria-label="Admin navigation">
        {links.map(({ href, label }) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          return <Link className={active ? "active" : ""} href={href} key={href}>{label}</Link>;
        })}
      </nav>
      <div className="topbar-user">
        <div><strong>{user.name}</strong><span>{user.email}</span></div>
        <button onClick={signOut}>Sign out</button>
      </div>
    </header>
  );
}
