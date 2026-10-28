import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminRecord = Record<string, unknown> & { id: string | number };

export type ResourceResult = {
  rows: AdminRecord[];
  error: string | null;
};

export async function readResource(
  supabase: SupabaseClient,
  table: string,
  orderColumn = "created_datetime_utc",
  limit = 100,
): Promise<ResourceResult> {
  const query = supabase.from(table).select("*").limit(limit);
  const { data, error } = await query.order(orderColumn, { ascending: false });

  if (!error) return { rows: (data ?? []) as AdminRecord[], error: null };

  // Some reference tables do not have timestamps. Retry without ordering so a
  // missing sort column never hides otherwise valid data.
  const fallback = await supabase.from(table).select("*").limit(limit);
  return {
    rows: (fallback.data ?? []) as AdminRecord[],
    error: fallback.error?.message ?? error.message,
  };
}

