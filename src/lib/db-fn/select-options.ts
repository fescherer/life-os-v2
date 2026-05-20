import { createSupabaseServerClient } from "@/lib/supabase-server";
import { SelectOption } from "@/types/select-option";

export async function getSelectOptions(): Promise<SelectOption[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("select_options")
    .select("*")
    .order("select_identifier")
    .order("position")
    .order("id");

  if (error) {
    throw error;
  }

  return data ?? [];
}
