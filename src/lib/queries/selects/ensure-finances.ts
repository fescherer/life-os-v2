import { Tables } from "@/types/supabase";
import { getSupabaseConfig } from "..";
import { slugify } from "../../util";

export type TTableSelect = Tables<"selects">;
export type TTableSelectOption = Tables<"selects_options">;

type DefaultSelect = {
  name: string;
  options: string[];
};

const DEFAULT_SELECTS: DefaultSelect[] = [
  {
    name: "finances_asset_entry_type",
    options: ["Buy", "Sell"],
  },
  {
    name: "finances_asset_type",
    options: ["FII", "STOCKS", "CRYPTO"],
  },
  {
    name: "finances_bank",
    options: ["Caixa Economica", "Nubank"],
  },
  {
    name: "finances_entry_type",
    options: ["Income", "Expense"],
  },
  {
    name: "finances_entry_category",
    options: ["Salario", "Renda Extra", "Compra", "Presente", "Subscricao"],
  },
];

function dedupeSelectsByName(selects: TTableSelect[]) {
  const uniqueSelects = new Map<string, TTableSelect>();

  for (const select of selects) {
    const existingSelect = uniqueSelects.get(select.name);

    if (!existingSelect || select.id < existingSelect.id) {
      uniqueSelects.set(select.name, select);
    }
  }

  return Array.from(uniqueSelects.values());
}

export async function ensureFinancesSelect(): Promise<TTableSelect[]> {
  const { user, supabase } = await getSupabaseConfig();

  const { error: upsertSelectsError } = await supabase.from("selects").upsert(
    DEFAULT_SELECTS.map((select) => ({
      user_id: user.id,
      name: select.name,
    })),
    {
      ignoreDuplicates: true,
      onConflict: "user_id,name",
    }
  );

  if (upsertSelectsError) throw upsertSelectsError;

  const { data: existingSelects, error: existingSelectsError } = await supabase
    .from("selects")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true })
    .order("id", { ascending: true });

  if (existingSelectsError) throw existingSelectsError;

  const canonicalSelects = dedupeSelectsByName(existingSelects ?? []);
  const optionsToUpsert =
    canonicalSelects.flatMap((select) => {
      const defaultSelect = DEFAULT_SELECTS.find(
        (defaultOption) => defaultOption.name === select.name
      );

      return (
        defaultSelect?.options.map((label) => ({
          user_id: user.id,
          select_id: select.id,
          label,
          value: slugify(label),
        })) ?? []
      );
    }) ?? [];

  if (optionsToUpsert.length > 0) {
    const { error: optionsError } = await supabase
      .from("selects_options")
      .upsert(optionsToUpsert, {
        ignoreDuplicates: true,
        onConflict: "user_id,select_id,value",
      });

    if (optionsError) throw optionsError;
  }

  return existingSelects ?? [];
}
