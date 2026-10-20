import { requireSuperadmin } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireSuperadmin();
  return (
    <div className="admin-shell">
      <Sidebar user={{
        email: user.email ?? "",
        name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Administrator",
      }} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
