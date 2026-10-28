"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Edit3, Plus, Search, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AdminRecord } from "@/lib/admin-data";

export type ResourceField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "boolean" | "email" | "select";
  required?: boolean;
  nullable?: boolean;
  options?: { label: string; value: string | number }[];
  editable?: boolean;
};

type ResourceManagerProps = {
  title: string;
  description: string;
  table: string;
  fields: ResourceField[];
  initialRows: AdminRecord[];
  initialError?: string | null;
  mode: "read" | "update" | "crud";
  createLabel?: string;
  emptyLabel?: string;
};

type Draft = Record<string, string | boolean>;

function formatCell(value: unknown, field: ResourceField) {
  if (value === null || value === undefined || value === "") return <span className="resource-null">—</span>;
  if (typeof value === "boolean") return <span className={value ? "status-chip on" : "status-chip"}>{value ? "YES" : "NO"}</span>;
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  if (field.key.includes("datetime") || field.key.endsWith("_at")) {
    const date = new Date(text);
    if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
  }
  return text;
}

function emptyDraft(fields: ResourceField[]): Draft {
  return Object.fromEntries(fields.map(field => [field.key, field.type === "boolean" ? false : ""]));
}

function rowDraft(row: AdminRecord, fields: ResourceField[]): Draft {
  return Object.fromEntries(fields.map(field => [field.key, field.type === "boolean" ? Boolean(row[field.key]) : String(row[field.key] ?? "")]));
}

function payloadFromDraft(draft: Draft, fields: ResourceField[]) {
  return Object.fromEntries(fields.filter(field => field.key !== "id" && field.editable !== false).map(field => {
    const value = draft[field.key];
    if (field.type === "boolean") return [field.key, Boolean(value)];
    if (field.type === "number" || field.type === "select") {
      if (value === "" && field.nullable) return [field.key, null];
      return [field.key, Number(value)];
    }
    return [field.key, value === "" && field.nullable ? null : value];
  }));
}

export function ResourceManager({
  title,
  description,
  table,
  fields,
  initialRows,
  initialError,
  mode,
  createLabel = "New record",
  emptyLabel = "No records yet.",
}: ResourceManagerProps) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(fields));
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(initialError ?? "");

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(row => fields.some(field => String(row[field.key] ?? "").toLowerCase().includes(needle)));
  }, [fields, query, rows]);

  function startCreate() {
    setEditing(null);
    setDraft(emptyDraft(fields));
    setError("");
    setOpen(true);
  }

  function startEdit(row: AdminRecord) {
    setEditing(row);
    setDraft(rowDraft(row, fields));
    setError("");
    setOpen(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const supabase = createClient();
    const payload: Record<string, unknown> = payloadFromDraft(draft, fields);
    if (editing && fields.some(field => field.key === "modified_datetime_utc")) {
      payload.modified_datetime_utc = new Date().toISOString();
    }
    const result = editing
      ? await supabase.from(table).update(payload).eq("id", editing.id).select().single()
      : await supabase.from(table).insert(payload).select().single();

    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      const saved = result.data as AdminRecord;
      setRows(current => editing ? current.map(row => row.id === editing.id ? saved : row) : [saved, ...current]);
      setOpen(false);
    }
    setSaving(false);
  }

  async function remove(row: AdminRecord) {
    if (!window.confirm(`Delete this ${title.toLowerCase()} record? This cannot be undone.`)) return;
    const result = await createClient().from(table).delete().eq("id", row.id);
    if (result.error) setError(result.error.message);
    else setRows(current => current.filter(candidate => candidate.id !== row.id));
  }

  return <section className="resource-panel" id={table}>
    <header className="resource-head">
      <div><p className="kicker">{mode === "read" ? "READ ONLY" : mode === "update" ? "READ / UPDATE" : "FULL CRUD"}</p><h2>{title}</h2><p>{description}</p></div>
      <strong>{rows.length.toString().padStart(2, "0")}</strong>
    </header>
    <div className="resource-toolbar">
      <label><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${title.toLowerCase()}…`} /></label>
      {mode === "crud" && <button className="signal-button" onClick={startCreate}><Plus size={15} /> {createLabel}</button>}
    </div>
    {error && <p className="error-banner"><strong>Database notice:</strong> {error}</p>}
    <div className="resource-table-wrap">
      <table className="resource-table">
        <thead><tr>{fields.map(field => <th key={field.key}>{field.label}</th>)}{mode !== "read" && <th><span className="sr-only">Actions</span></th>}</tr></thead>
        <tbody>
          {visibleRows.map(row => <tr key={String(row.id)}>{fields.map(field => <td key={field.key} className={field.key === "id" ? "mono" : ""}>{formatCell(row[field.key], field)}</td>)}{mode !== "read" && <td className="row-actions"><button onClick={() => startEdit(row)} aria-label={`Edit ${title}`}><Edit3 size={15} /></button>{mode === "crud" && <button onClick={() => remove(row)} aria-label={`Delete ${title}`}><Trash2 size={15} /></button>}</td>}</tr>)}
          {!visibleRows.length && <tr><td className="resource-empty" colSpan={fields.length + (mode === "read" ? 0 : 1)}>{emptyLabel}</td></tr>}
        </tbody>
      </table>
    </div>
    {open && <div className="modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && setOpen(false)}>
      <section className="editor-modal resource-editor" role="dialog" aria-modal="true" aria-labelledby={`${table}-editor-title`}>
        <div className="modal-head"><div><p className="kicker">{editing ? "UPDATE / EXISTING RECORD" : "CREATE / NEW RECORD"}</p><h2 id={`${table}-editor-title`}>{editing ? `Edit ${title}` : createLabel}</h2></div><button onClick={() => setOpen(false)} aria-label="Close editor"><X size={19} /></button></div>
        <form onSubmit={save}>
          <div className="form-grid">
            {fields.filter(field => field.key !== "id" && field.editable !== false).map(field => <label className={field.type === "textarea" ? "wide" : ""} key={field.key}>
              <span>{field.label}</span>
              {field.type === "textarea" ? <textarea rows={4} required={field.required} value={String(draft[field.key] ?? "")} onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))} />
                : field.type === "boolean" ? <span className="check-field"><input type="checkbox" checked={Boolean(draft[field.key])} onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.checked }))} /> Enabled</span>
                : field.type === "select" ? <select required={field.required} value={String(draft[field.key] ?? "")} onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))}><option value="">Select…</option>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                : <input type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"} required={field.required} value={String(draft[field.key] ?? "")} onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))} />}
            </label>)}
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions"><button type="button" onClick={() => setOpen(false)}>Cancel</button><button className="signal-button" disabled={saving}>{saving ? "Writing…" : editing ? "Save changes" : "Create record"}<ArrowUpRight size={15} /></button></div>
        </form>
      </section>
    </div>}
  </section>;
}
