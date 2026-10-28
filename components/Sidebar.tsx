"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cpu, LayoutDashboard, LogOut, MessageSquareText, ShieldCheck, Sparkles, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/generation", label: "Generation", icon: Sparkles },
  { href: "/prompts", label: "Prompts", icon: MessageSquareText },
  { href: "/models", label: "Models", icon: Cpu },
  { href: "/access", label: "Access", icon: ShieldCheck },
  { href: "/ratings", label: "Ratings", icon: Star },
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
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <Link className="admin-mark" href="/" aria-label="POPUP.NYC admin">
          <strong>POPUP.NYC</strong><small>Admin</small>
        </Link>
      </div>
      <nav className="sidebar-nav" aria-label="Admin navigation">
        <p>Workspace</p>
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          return <Link aria-current={active ? "page" : undefined} className={active ? "active" : ""} href={href} key={href}><Icon aria-hidden="true" size={17} strokeWidth={1.7} /><span>{label}</span></Link>;
        })}
      </nav>
      <div className="sidebar-user">
        <span className="user-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
        <div><strong>{user.name}</strong><span>{user.email}</span></div>
        <button aria-label="Sign out" onClick={signOut} title="Sign out"><LogOut aria-hidden="true" size={17} strokeWidth={1.7} /></button>
      </div>
    </aside>
  );
}
