"use client";

/* Remote teaching-data URLs span multiple hosts, so native images are intentional here. */
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { ExternalLink, Search, X } from "lucide-react";

export type MediaViewItem = {
  id: string;
  title: string;
  description: string;
  meta: string;
  url: string | null;
  createdAt: string | null;
};

export function MediaViewer({ items, error }: { items: MediaViewItem[]; error?: string | null }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MediaViewItem | null>(null);
  const visible = useMemo(() => items.filter(item => `${item.title} ${item.description} ${item.meta}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

  return <section className="resource-panel media-library" id="generated-media">
    <header className="resource-head"><div><p className="kicker">READ / VIEW</p><h2>AI generated media</h2><p>Inspect generated images and their prompt context without changing source records.</p></div><strong>{items.length.toString().padStart(2, "0")}</strong></header>
    <div className="resource-toolbar"><label><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search media…" /></label></div>
    {error && <p className="error-banner"><strong>Database notice:</strong> {error}</p>}
    <div className="media-view-grid">
      {visible.map(item => <button className="media-view-card" key={item.id} onClick={() => setSelected(item)}>
        <span className="media-preview">{item.url ? <img src={item.url} alt="" /> : <i>AI</i>}</span>
        <span><small>{item.meta}</small><strong>{item.title}</strong><em>{item.description || "No description"}</em></span>
      </button>)}
      {!visible.length && <p className="resource-empty">No generated media found.</p>}
    </div>
    {selected && <div className="modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && setSelected(null)}>
      <section className="editor-modal media-detail" role="dialog" aria-modal="true" aria-labelledby="media-detail-title">
        <div className="modal-head"><div><p className="kicker">MEDIA / SOURCE RECORD</p><h2 id="media-detail-title">{selected.title}</h2></div><button onClick={() => setSelected(null)} aria-label="Close media viewer"><X size={19} /></button></div>
        {selected.url && <img src={selected.url} alt={selected.title} />}
        <div className="media-detail-copy"><p>{selected.description}</p><span className="mono">{selected.id}</span>{selected.createdAt && <span>{new Date(selected.createdAt).toLocaleString()}</span>}</div>
        {selected.url && <a className="signal-button" href={selected.url} target="_blank" rel="noreferrer">Open original <ExternalLink size={15} /></a>}
      </section>
    </div>}
  </section>;
}
