import { supabase } from "../supabase";

export async function updateRow(
  rowId: string,
  data: Record<string, unknown>
) {
  return supabase
    .from("app_data")
    .update({
      data,
    })
    .eq("id", rowId);
}
