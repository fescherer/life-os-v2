import { supabase } from "../supabase";

export async function deleteRow(rowId: string) {
  return supabase
    .from("app_data")
    .delete()
    .eq("id", rowId);
}
