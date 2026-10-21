import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import { requireSuperadmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { TrendChart } from "@/components/TrendChart";
import type { Generation, Profile, Vote } from "@/lib/types";

export default async function DashboardPage() {
  const { supabase } = await requireSuperadmin();
  const [{ data: generations }, { data: profiles }, { data: votes }] = await Promise.all([
    supabase.from("ai_generations").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*"),
    supabase.from("votes").select("*").order("created_at", { ascending: false }),
  ]);
  const media = (generations ?? []) as Generation[];
  const people = (profiles ?? []) as Profile[];
  const signals = (votes ?? []) as Vote[];
  const up = signals.filter(v => v.value > 0).length;
  const approval = signals.length ? Math.round((up / signals.length) * 100) : 0;
  const creatorCount = new Set(media.map(m => m.creator_id)).size;
  const superadminCount = people.filter(p => p.is_superadmin).length;
  const neighborhoods = Object.entries(media.reduce<Record<string, number>>((acc, item) => {
    acc[item.neighborhood] = (acc[item.neighborhood] ?? 0) + 1; return acc;
  }, {})).sort((a, b) => b[1] - a[1]);
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - offset));
    const key = date.toLocaleDateString("en-CA");
    return media.filter(item => item.generated_on === key).length;
  });

  return <>
    <PageHeader eyebrow="LIVE / DATABASE OVERVIEW" title="City pulse" copy="What the generator made, who showed up, and what the crowd endorsed." action={<div className="live-pill"><Radio size={14} /> Database live</div>} />
    <section className="metric-strip">
      <article className="metric-primary"><span>TOTAL AI MEDIA</span><strong>{media.length.toString().padStart(2, "0")}</strong><small>{creatorCount} creator{creatorCount === 1 ? "" : "s"}</small></article>
      <article><span>TOTAL VOTES</span><strong>{signals.length}</strong><small>{up} upvotes / {signals.length - up} downvotes</small></article>
      <article><span>UPVOTE RATE</span><strong>{approval}%</strong><div className="approval-rule"><i style={{ width: `${approval}%` }} /></div></article>
      <article><span>TOTAL PROFILES</span><strong>{people.length}</strong><small>{superadminCount} superadmin{superadminCount === 1 ? "" : "s"}</small></article>
    </section>
    <section className="dashboard-grid">
      <article className="panel activity-panel">
        <div className="panel-head"><div><span>01 / CREATION VELOCITY</span><h2>Seven-day output</h2></div><strong>{days.reduce((a,b) => a+b, 0)}</strong></div>
        <TrendChart values={days} />
        <div className="chart-labels"><span>−6 DAYS</span><span>TODAY</span></div>
      </article>
      <article className="panel neighborhood-panel">
        <div className="panel-head"><div><span>02 / PLACE INDEX</span><h2>Neighborhood heat</h2></div><Link href="/media">Open index <ArrowUpRight size={14} /></Link></div>
        <div className="neighborhood-list">
          {neighborhoods.slice(0, 5).map(([name, count], index) => <div key={name}><b>0{index + 1}</b><span>{name}</span><i style={{ width: `${Math.max(14, (count / (neighborhoods[0]?.[1] || 1)) * 100)}%` }} /><strong>{count}</strong></div>)}
        </div>
      </article>
      <article className="panel recent-panel">
        <div className="panel-head"><div><span>03 / LATEST OUTPUT</span><h2>Fresh from the model</h2></div></div>
        <div className="recent-list">
          {media.slice(0, 4).map((item, index) => <Link href={`/media?edit=${item.id}`} key={item.id}><b>{String(index + 1).padStart(2,"0")}</b><div><strong>{item.title}</strong><span>{item.collaboration} · {item.neighborhood}</span></div><ArrowUpRight size={16} /></Link>)}
        </div>
      </article>
      <article className="panel model-panel">
        <div className="panel-head"><div><span>04 / MODEL LEDGER</span><h2>Generation stack</h2></div></div>
        {[...new Set(media.map(m => m.model))].map(model => {
          const count = media.filter(m => m.model === model).length;
          return <div className="model-row" key={model}><span>{model}</span><i><b style={{ width: `${(count / Math.max(media.length,1))*100}%` }} /></i><strong>{count}</strong></div>;
        })}
      </article>
    </section>
  </>;
}
