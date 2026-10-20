import { PageHeader } from "@/components/PageHeader";
import { MediaManager } from "@/components/MediaManager";
import { requireSuperadmin } from "@/lib/auth";
import type { Generation } from "@/lib/types";

export default async function MediaPage() {
  const { supabase, user } = await requireSuperadmin();
  const { data } = await supabase.from("ai_generations").select("*").order("created_at", { ascending: false });
  return <>
    <PageHeader eyebrow="FULL ACCESS / AI OUTPUT" title="AI media" copy="Create, inspect, revise, and retire generated pop-up concepts." />
    <MediaManager initialItems={(data ?? []) as Generation[]} userId={user.id} />
  </>;
}
