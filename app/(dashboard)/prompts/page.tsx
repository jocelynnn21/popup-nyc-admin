import { PageHeader } from "@/components/PageHeader";
import { ResourceManager, type ResourceField } from "@/components/ResourceManager";
import { requireSuperadmin } from "@/lib/auth";
import { readResource } from "@/lib/admin-data";

const chainFields: ResourceField[] = [
  { key: "id", label: "Chain ID", editable: false },
  { key: "caption_request_id", label: "Request", editable: false },
  { key: "created_datetime_utc", label: "Created", editable: false },
];

const stepFields: ResourceField[] = [
  { key: "id", label: "Step ID", editable: false },
  { key: "humor_flavor_id", label: "Prompt chain", editable: false },
  { key: "order_by", label: "Order", editable: false },
  { key: "description", label: "Description", editable: false },
  { key: "llm_model_id", label: "Model", editable: false },
  { key: "is_hidden", label: "Hidden", editable: false },
];

const mixFields: ResourceField[] = [
  { key: "id", label: "Mix ID", editable: false },
  { key: "humor_flavor_id", label: "Prompt chain", editable: false },
  { key: "caption_count", label: "Caption count", type: "number", required: true },
  { key: "modified_datetime_utc", label: "Last updated", editable: false },
];

const termFields: ResourceField[] = [
  { key: "id", label: "ID", editable: false },
  { key: "term", label: "Term", required: true },
  { key: "definition", label: "Definition", type: "textarea", required: true },
  { key: "example", label: "Example", type: "textarea", required: true },
  { key: "priority", label: "Priority", type: "number", required: true },
  { key: "term_type_id", label: "Type ID", type: "number", nullable: true },
];

export default async function PromptsPage() {
  const { supabase } = await requireSuperadmin();
  const [chains, steps, mix, terms] = await Promise.all([
    readResource(supabase, "llm_prompt_chains"),
    readResource(supabase, "humor_flavor_steps", "order_by"),
    readResource(supabase, "humor_flavor_mix", "modified_datetime_utc"),
    readResource(supabase, "terms", "priority"),
  ]);

  return <>
    <PageHeader eyebrow="PROMPT OPERATIONS / PIPELINE" title="Prompt system" copy="Trace every generated chain, inspect its steps, tune the active mix, and maintain reusable terms." />
    <nav className="section-index" aria-label="Prompt system sections">
      <a href="#llm_prompt_chains">Chains</a><a href="#humor_flavor_steps">Steps</a><a href="#humor_flavor_mix">Mix</a><a href="#terms">Terms</a>
    </nav>
    <div className="resource-stack">
      <ResourceManager title="Prompt chains" description="Generation pipelines linked to their source requests." table="llm_prompt_chains" fields={chainFields} initialRows={chains.rows} initialError={chains.error} mode="read" />
      <ResourceManager title="Prompt chain steps" description="Ordered instructions, models, and visibility across every pipeline." table="humor_flavor_steps" fields={stepFields} initialRows={steps.rows} initialError={steps.error} mode="read" />
      <ResourceManager title="Prompt chain mix" description="Control how many captions each prompt chain contributes to a generation run." table="humor_flavor_mix" fields={mixFields} initialRows={mix.rows} initialError={mix.error} mode="update" />
      <ResourceManager title="Terms" description="Reusable vocabulary, definitions, and examples used by the prompt system." table="terms" fields={termFields} initialRows={terms.rows} initialError={terms.error} mode="crud" createLabel="New term" />
    </div>
  </>;
}

