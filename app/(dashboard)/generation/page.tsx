import { MediaViewer, type MediaViewItem } from "@/components/MediaViewer";
import { PageHeader } from "@/components/PageHeader";
import { ResourceManager, type ResourceField } from "@/components/ResourceManager";
import { requireSuperadmin } from "@/lib/auth";
import { readResource } from "@/lib/admin-data";

const requestFields: ResourceField[] = [
  { key: "id", label: "Request ID", editable: false },
  { key: "image_id", label: "Media", editable: false },
  { key: "profile_id", label: "Profile", editable: false },
  { key: "created_datetime_utc", label: "Requested", editable: false },
];

const exampleFields: ResourceField[] = [
  { key: "id", label: "ID", editable: false },
  { key: "caption", label: "Caption", type: "textarea", required: true },
  { key: "image_description", label: "Image description", type: "textarea", required: true },
  { key: "explanation", label: "Why it works", type: "textarea", required: true },
  { key: "priority", label: "Priority", type: "number", required: true },
  { key: "caption_example_category_id", label: "Category ID", type: "number", nullable: true },
];

export default async function GenerationPage() {
  const { supabase } = await requireSuperadmin();
  const [images, popupGenerations, requests, examples] = await Promise.all([
    readResource(supabase, "images"),
    readResource(supabase, "ai_generations", "created_at"),
    readResource(supabase, "caption_requests"),
    readResource(supabase, "caption_examples", "priority"),
  ]);

  let media: MediaViewItem[] = images.rows.map(row => ({
    id: String(row.id),
    title: String(row.image_description ?? "Untitled generated image"),
    description: String(row.additional_context ?? row.celebrity_recognition ?? ""),
    meta: row.is_common_use ? "COMMON USE" : "GENERATED MEDIA",
    url: typeof row.url === "string" ? row.url : null,
    createdAt: typeof row.created_datetime_utc === "string" ? row.created_datetime_utc : null,
  }));
  media = media.concat(popupGenerations.rows.map(row => ({
      id: String(row.id),
      title: String(row.title ?? "Untitled generation"),
      description: String(row.concept ?? row.prompt ?? ""),
      meta: String(row.model ?? "AI GENERATION").toUpperCase(),
      url: null,
      createdAt: typeof row.created_at === "string" ? row.created_at : null,
    })));
  const mediaError = images.error && popupGenerations.error ? `${images.error} / ${popupGenerations.error}` : null;

  return <>
    <PageHeader eyebrow="GENERATION / SOURCE TO OUTPUT" title="Generation lab" copy="Review generated media and request history, then curate the examples that guide future AI output." />
    <nav className="section-index" aria-label="Generation sections"><a href="#generated-media">Media</a><a href="#caption_requests">Requests</a><a href="#caption_examples">Examples</a></nav>
    <div className="resource-stack">
      <MediaViewer items={media} error={mediaError} />
      <ResourceManager title="Generation requests" description="Read-only request records connecting profiles, source media, and generation time." table="caption_requests" fields={requestFields} initialRows={requests.rows} initialError={requests.error} mode="read" />
      <ResourceManager title="AI generation examples" description="Curated examples that show the model what a successful output looks like." table="caption_examples" fields={exampleFields} initialRows={examples.rows} initialError={examples.error} mode="crud" createLabel="New example" />
    </div>
  </>;
}
