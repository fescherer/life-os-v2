import { createSupabaseServerClient } from "../supabase-server";

export async function getTableRows<T>(
  tableId: string
): Promise<(T & { id: string; created_at: string; updated_at: string })[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("app_data")
    .select("*")
    .eq("table_id", tableId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (
    data?.map((row) => ({
      id: row.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      ...(row.data as T),
    })) ?? []
  );
}
