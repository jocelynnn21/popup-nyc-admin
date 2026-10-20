"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Images, LogOut, MessageSquareText, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "City pulse", icon: BarChart3 },
  { href: "/media", label: "AI media", icon: Images },
  { href: "/people", label: "People", icon: Users },
  { href: "/ratings", label: "Ratings", icon: MessageSquareText },
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
    <aside className="sidebar">
      <Link className="admin-mark" href="/" aria-label="POPUP.NYC control room">
        <span>P/</span><strong>POPUP.NYC</strong><small>CONTROL ROOM</small>
      </Link>
      <nav aria-label="Admin navigation">
        {links.map(({ href, label, icon: Icon }, index) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          return <Link className={active ? "active" : ""} href={href} key={href}>
            <span>0{index + 1}</span><Icon size={17} />{label}
          </Link>;
        })}
      </nav>
      <div className="sidebar-user">
        <div className="avatar-monogram">{user.name.charAt(0)}</div>
        <div><strong>{user.name}</strong><span>{user.email}</span></div>
        <button aria-label="Sign out" onClick={signOut}><LogOut size={16} /></button>
      </div>
    </aside>
  );
}
