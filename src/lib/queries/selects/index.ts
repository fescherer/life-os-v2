import { Tables } from "@/types/supabase";
import { getSupabaseConfig } from "..";
import { slugify } from "../../util";
import { ensureFinancesSelect, TTableSelectOption } from "./ensure-finances";

export type TTableSelect = Tables<"selects">;
export type TSelectWithOptions = TTableSelect & {
  options: TTableSelectOption[];
};

export async function ensureSelectsCreation(): Promise<void> {
  await ensureFinancesSelect();
}

export async function getSelectsWithOptions(): Promise<TSelectWithOptions[]> {
  const { user, supabase } = await getSupabaseConfig();

  const { data: selects, error: selectsError } = await supabase
    .from("selects")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (selectsError) throw selectsError;

  if (!selects?.length) {
    return [];
  }

  const selectIds = selects.map((select) => select.id);

  const { data: options, error: optionsError } = await supabase
    .from("selects_options")
    .select("*")
    .eq("user_id", user.id)
    .in("select_id", selectIds)
    .order("label", { ascending: true });

  if (optionsError) throw optionsError;

  const optionsBySelectId = new Map<number, TTableSelectOption[]>();

  for (const option of options ?? []) {
    const currentOptions = optionsBySelectId.get(option.select_id) ?? [];
    currentOptions.push(option);
    optionsBySelectId.set(option.select_id, currentOptions);
  }

  return selects.map((select) => ({
    ...select,
    options: optionsBySelectId.get(select.id) ?? [],
  }));
}

export async function getSelectOptionsByName(
  name: string
): Promise<TTableSelectOption[]> {
  const { user, supabase } = await getSupabaseConfig();

  const { data: select, error: selectError } = await supabase
    .from("selects")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", name)
    .single();

  if (selectError) throw selectError;

  const { data, error } = await supabase
    .from("selects_options")
    .select("*")
    .eq("user_id", user.id)
    .eq("select_id", select.id)
    .order("label", { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function createSelectOptionBySelectName({
  selectName,
  label,
}: {
  selectName: string;
  label: string;
}): Promise<TTableSelectOption> {
  const { user, supabase } = await getSupabaseConfig();

  const labelSlugfied = slugify(label)
  if (!labelSlugfied) {
    throw new Error("A opção precisa conter pelo menos uma letra ou número.");
  }

  const { data: select, error: selectError } = await supabase
    .from("selects")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", selectName)
    .single();

  if (selectError) throw selectError;

  const { data, error } = await supabase
    .from("selects_options")
    .insert({
      user_id: user.id,
      select_id: select.id,
      label,
      value: labelSlugfied,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function deleteSelectOption(id: number): Promise<void> {
  const { user, supabase } = await getSupabaseConfig();

  const { error } = await supabase
    .from("selects_options")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function renameSelectOption({
  id,
  label,
}: {
  id: number;
  label: string;
}): Promise<TTableSelectOption> {
  const { user, supabase } = await getSupabaseConfig();

  const labelSlugfied = slugify(label)
  if (!labelSlugfied) {
    throw new Error("A opção precisa conter pelo menos uma letra ou número.");
  }

  const { data, error } = await supabase
    .from("selects_options")
    .update({
      label,
      value: labelSlugfied,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}
