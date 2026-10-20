import { PageHeader } from "@/components/PageHeader";
import { requireSuperadmin } from "@/lib/auth";
import type { Profile } from "@/lib/types";

export default async function PeoplePage() {
  const { supabase } = await requireSuperadmin();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  const profiles = (data ?? []) as Profile[];
  return <>
    <PageHeader eyebrow="READ-ONLY / IDENTITY DIRECTORY" title="People" copy="Google-authenticated profiles connected to the POPUP.NYC database." />
    <section className="panel table-panel">
      <div className="table-summary"><span>{profiles.length} total profiles</span><span>{profiles.filter(p => p.is_superadmin).length} superadmin</span></div>
      <div className="data-table people-table">
        <div className="data-row data-head"><span>Identity</span><span>Joined</span><span>Role</span><span>Profile ID</span></div>
        {profiles.map(profile => {
          const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Unnamed profile";
          return <div className="data-row" key={profile.id}>
            <span className="identity-cell"><i>{name.charAt(0)}</i><b>{name}</b></span>
            <span>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(profile.created_at))}</span>
            <span><em className={profile.is_superadmin ? "role admin" : "role"}>{profile.is_superadmin ? "SUPERADMIN" : "MEMBER"}</em></span>
            <span className="mono">{profile.id.slice(0, 8)}…</span>
          </div>;
        })}
      </div>
    </section>
  </>;
}
