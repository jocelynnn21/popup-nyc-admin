import { PageHeader } from "@/components/PageHeader";
import { ResourceManager, type ResourceField } from "@/components/ResourceManager";
import { requireSuperadmin } from "@/lib/auth";
import { readResource } from "@/lib/admin-data";

const userFields: ResourceField[] = [
  { key: "id", label: "Profile ID", editable: false },
  { key: "email", label: "Email", editable: false },
  { key: "first_name", label: "First name", editable: false },
  { key: "last_name", label: "Last name", editable: false },
  { key: "is_superadmin", label: "Superadmin", editable: false },
];

const domainFields: ResourceField[] = [
  { key: "id", label: "ID", editable: false },
  { key: "apex_domain", label: "Allowed domain", required: true },
  { key: "modified_datetime_utc", label: "Last updated", editable: false },
];

const emailFields: ResourceField[] = [
  { key: "id", label: "ID", editable: false },
  { key: "email_address", label: "Whitelisted email", type: "email", required: true },
  { key: "modified_datetime_utc", label: "Last updated", editable: false },
];

export default async function AccessPage() {
  const { supabase } = await requireSuperadmin();
  const [profiles, domains, emails] = await Promise.all([
    readResource(supabase, "profiles", "created_at"),
    readResource(supabase, "allowed_signup_domains"),
    readResource(supabase, "whitelist_email_addresses"),
  ]);

  return <>
    <PageHeader eyebrow="ACCESS / IDENTITY CONTROL" title="Access registry" copy="See every authenticated profile and maintain exactly who may create an account." />
    <nav className="section-index" aria-label="Access registry sections"><a href="#profiles">Users</a><a href="#allowed_signup_domains">Domains</a><a href="#whitelist_email_addresses">Email whitelist</a></nav>
    <div className="resource-stack">
      <ResourceManager title="Users" description="Google-authenticated profiles and their current superadmin status." table="profiles" fields={userFields} initialRows={profiles.rows} initialError={profiles.error} mode="read" />
      <ResourceManager title="Allowed signup domains" description="Apex domains whose members may create an account." table="allowed_signup_domains" fields={domainFields} initialRows={domains.rows} initialError={domains.error} mode="crud" createLabel="Add domain" />
      <ResourceManager title="Whitelisted email addresses" description="Individual email addresses approved independently of their domain." table="whitelist_email_addresses" fields={emailFields} initialRows={emails.rows} initialError={emails.error} mode="crud" createLabel="Add email" />
    </div>
  </>;
}
