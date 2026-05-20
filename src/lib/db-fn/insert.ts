import { supabase } from "../supabase";

export async function insertRow(
  tableId: string,
  data: Record<string, unknown>
) {
  const user = await supabase.auth.getUser();

  return supabase.from("app_data").insert({
    user_id: user.data.user?.id,
    table_id: tableId,
    data,
  });
}
