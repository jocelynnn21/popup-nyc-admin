"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Edit3, Plus, Search, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Generation } from "@/lib/types";

type Draft = Pick<Generation, "title" | "collaboration" | "concept" | "hook" | "neighborhood" | "category" | "model" | "prompt">;
const emptyDraft: Draft = {
  title: "", collaboration: "", concept: "", hook: "", neighborhood: "",
  category: "experience", model: "admin/manual", prompt: "Created from the admin desk.",
};

export function MediaManager({ initialItems, userId }: { initialItems: Generation[]; userId: string }) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Generation | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("edit");
    const item = items.find(candidate => candidate.id === id);
    if (item) startEdit(item);
  // Only inspect the incoming URL once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => items.filter(item =>
    [item.title, item.collaboration, item.neighborhood, item.category]
      .some(value => value.toLowerCase().includes(query.toLowerCase())),
  ), [items, query]);

  function startCreate() { setEditing(null); setDraft(emptyDraft); setError(""); setOpen(true); }
  function startEdit(item: Generation) {
    setEditing(item);
    setDraft({ title:item.title, collaboration:item.collaboration, concept:item.concept, hook:item.hook, neighborhood:item.neighborhood, category:item.category, model:item.model, prompt:item.prompt });
    setError(""); setOpen(true);
  }
  function update(field: keyof Draft, value: string) { setDraft(current => ({ ...current, [field]: value })); }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const supabase = createClient();
    if (editing) {
      const { data, error } = await supabase.from("ai_generations").update(draft).eq("id", editing.id).select().single();
      if (error) setError(error.message); else { setItems(current => current.map(item => item.id === editing.id ? data as Generation : item)); setOpen(false); }
    } else {
      const payload = { ...draft, creator_id:userId, generated_on:new Date().toLocaleDateString("en-CA"), daily_slot:null };
      const { data, error } = await supabase.from("ai_generations").insert(payload).select().single();
      if (error) setError(error.message); else { setItems(current => [data as Generation, ...current]); setOpen(false); }
    }
    setSaving(false);
  }

  async function remove(item: Generation) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    const { error } = await createClient().from("ai_generations").delete().eq("id", item.id);
    if (error) setError(error.message); else setItems(current => current.filter(candidate => candidate.id !== item.id));
  }

  return <>
    <div className="media-toolbar">
      <label><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title, partner, neighborhood…" /></label>
      <button className="signal-button" onClick={startCreate}><Plus size={16} /> New concept</button>
    </div>
    {error && !open && <p className="error-banner">{error}</p>}
    <section className="media-grid">
      {filtered.map((item, index) => <article className="media-card" key={item.id}>
        <div className="media-card-top"><span>{String(index + 1).padStart(2,"0")} / {item.neighborhood.toUpperCase()}</span><em>{item.category}</em></div>
        <h2>{item.title}</h2>
        <p className="collab">{item.collaboration}</p>
        <p>{item.concept}</p>
        <div className="media-card-foot"><span>{item.model}</span><div><button onClick={() => startEdit(item)} aria-label={`Edit ${item.title}`}><Edit3 size={15} /></button><button onClick={() => remove(item)} aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button></div></div>
      </article>)}
      {!filtered.length && <div className="empty-state"><strong>No concepts found.</strong><span>Change the search or add a new piece of AI media.</span></div>}
    </section>
    {open && <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && setOpen(false)}>
      <section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <div className="modal-head"><div><p className="kicker">{editing ? "UPDATE / EXISTING RECORD" : "CREATE / NEW RECORD"}</p><h2 id="editor-title">{editing ? "Edit concept" : "Add AI media"}</h2></div><button onClick={() => setOpen(false)} aria-label="Close editor"><X size={19} /></button></div>
        <form onSubmit={save}>
          <div className="form-grid">
            <label><span>Title</span><input required value={draft.title} onChange={e=>update("title",e.target.value)} /></label>
            <label><span>Collaboration</span><input required value={draft.collaboration} onChange={e=>update("collaboration",e.target.value)} /></label>
            <label><span>Neighborhood</span><input required value={draft.neighborhood} onChange={e=>update("neighborhood",e.target.value)} /></label>
            <label><span>Category</span><input required value={draft.category} onChange={e=>update("category",e.target.value)} /></label>
            <label className="wide"><span>Concept</span><textarea required rows={3} value={draft.concept} onChange={e=>update("concept",e.target.value)} /></label>
            <label className="wide"><span>Hook</span><textarea required rows={2} value={draft.hook} onChange={e=>update("hook",e.target.value)} /></label>
            <label><span>Model</span><input required value={draft.model} onChange={e=>update("model",e.target.value)} /></label>
            <label><span>Prompt provenance</span><input required value={draft.prompt} onChange={e=>update("prompt",e.target.value)} /></label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions"><button type="button" onClick={() => setOpen(false)}>Cancel</button><button className="signal-button" disabled={saving}>{saving ? "Writing…" : editing ? "Save changes" : "Create concept"}<ArrowUpRight size={16}/></button></div>
        </form>
      </section>
    </div>}
  </>;
}
