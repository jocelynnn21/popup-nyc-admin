import { ArrowDown, ArrowUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSuperadmin } from "@/lib/auth";
import type { Generation, Profile, Vote } from "@/lib/types";

export default async function RatingsPage() {
  const { supabase } = await requireSuperadmin();
  const [{ data: votes }, { data: generations }, { data: profiles }] = await Promise.all([
    supabase.from("votes").select("*").order("created_at", { ascending: false }),
    supabase.from("ai_generations").select("id,title,collaboration,neighborhood"),
    supabase.from("profiles").select("id,first_name,last_name"),
  ]);
  const media = (generations ?? []) as Pick<Generation, "id"|"title"|"collaboration"|"neighborhood">[];
  const people = (profiles ?? []) as Pick<Profile, "id"|"first_name"|"last_name">[];
  const signals = (votes ?? []) as Vote[];
  const lookupMedia = Object.fromEntries(media.map(item => [item.id, item]));
  const lookupPeople = Object.fromEntries(people.map(item => [item.id, item]));
  return <>
    <PageHeader eyebrow="READ-ONLY / COMMUNITY SIGNALS" title="Ratings" copy="Every upvote and downvote, resolved to the concept and profile behind it." />
    <section className="rating-tally">
      <div><ArrowUp size={18} /><strong>{signals.filter(v => v.value > 0).length}</strong><span>UPVOTES</span></div>
      <div><ArrowDown size={18} /><strong>{signals.filter(v => v.value <= 0).length}</strong><span>DOWNVOTES</span></div>
      <p>Signals are immutable here. This desk observes audience taste without rewriting it.</p>
    </section>
    <section className="panel table-panel">
      <div className="data-table ratings-table">
        <div className="data-row data-head"><span>Signal</span><span>Concept</span><span>Profile</span><span>Timestamp</span></div>
        {signals.map(vote => {
          const item = lookupMedia[vote.generation_id]; const person = lookupPeople[vote.user_id];
          const name = person ? [person.first_name, person.last_name].filter(Boolean).join(" ") : "Unknown profile";
          return <div className="data-row" key={vote.id}>
            <span><em className={vote.value > 0 ? "vote up" : "vote down"}>{vote.value > 0 ? <ArrowUp size={14}/> : <ArrowDown size={14}/>} {vote.value > 0 ? "UP" : "DOWN"}</em></span>
            <span><b>{item?.title ?? "Deleted concept"}</b><small>{item?.collaboration}</small></span>
            <span>{name}</span>
            <span>{new Intl.DateTimeFormat("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" }).format(new Date(vote.created_at))}</span>
          </div>;
        })}
      </div>
    </section>
  </>;
}
