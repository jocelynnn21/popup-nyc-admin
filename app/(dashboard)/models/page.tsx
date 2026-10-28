import { PageHeader } from "@/components/PageHeader";
import { ResourceManager, type ResourceField } from "@/components/ResourceManager";
import { requireSuperadmin } from "@/lib/auth";
import { readResource } from "@/lib/admin-data";

const providerFields: ResourceField[] = [
  { key: "id", label: "ID", editable: false },
  { key: "name", label: "Provider name", required: true },
  { key: "modified_datetime_utc", label: "Last updated", editable: false },
];

const responseFields: ResourceField[] = [
  { key: "id", label: "Response ID", editable: false },
  { key: "caption_request_id", label: "Request", editable: false },
  { key: "llm_model_id", label: "Model", editable: false },
  { key: "llm_model_response", label: "Response", editable: false },
  { key: "processing_time_seconds", label: "Seconds", editable: false },
  { key: "created_datetime_utc", label: "Created", editable: false },
];

export default async function ModelsPage() {
  const { supabase } = await requireSuperadmin();
  const [providers, models, responses] = await Promise.all([
    readResource(supabase, "llm_providers", "name"),
    readResource(supabase, "llm_models", "name"),
    readResource(supabase, "llm_model_responses"),
  ]);
  const providerOptions = providers.rows.map(row => ({ label: String(row.name ?? `Provider ${row.id}`), value: row.id }));
  const modelFields: ResourceField[] = [
    { key: "id", label: "ID", editable: false },
    { key: "name", label: "Model name", required: true },
    { key: "provider_model_id", label: "Provider model ID", required: true },
    { key: "llm_provider_id", label: "Provider", type: "select", required: true, options: providerOptions },
    { key: "is_temperature_supported", label: "Temperature", type: "boolean" },
  ];

  return <>
    <PageHeader eyebrow="MODEL REGISTRY / INFRASTRUCTURE" title="Model registry" copy="Maintain model and provider records while keeping the full response stream available for inspection." />
    <nav className="section-index" aria-label="Model registry sections"><a href="#llm_models">Models</a><a href="#llm_providers">Providers</a><a href="#llm_model_responses">Responses</a></nav>
    <div className="resource-stack">
      <ResourceManager title="LLM models" description="Models available to prompt chains and generation jobs." table="llm_models" fields={modelFields} initialRows={models.rows} initialError={models.error} mode="crud" createLabel="New model" />
      <ResourceManager title="LLM providers" description="The organizations and APIs that supply language models." table="llm_providers" fields={providerFields} initialRows={providers.rows} initialError={providers.error} mode="crud" createLabel="New provider" />
      <ResourceManager title="LLM responses" description="Read-only model outputs with request, model, latency, and timestamp context." table="llm_model_responses" fields={responseFields} initialRows={responses.rows} initialError={responses.error} mode="read" />
    </div>
  </>;
}

