import { createSupabaseServerClient } from "../supabase-server";

export async function getTableRows<T>(
  tableId: string
): Promise<(T & { id: string })[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("app_data")
    .select("*")
    .eq("table_id", tableId)
    .order("position");

  if (error) {
    throw error;
  }

  return (
    data?.map((row) => ({
      id: row.id,
      ...(row.data as T),
    })) ?? []
  );
}
