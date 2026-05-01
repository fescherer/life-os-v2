import { getSupabaseConfig } from "@/lib/queries";
import type { Tables } from "@/types/supabase";

export type FinanceEntry = Tables<"fin_entries">;
export type FinanceAssetEntry = Tables<"fin_assets_entries">;

export type FinanceEditRecord =
  | {
      bankId: number;
      categoryId: number;
      date: string;
      description: string;
      id: number;
      table: "fin_entries";
      typeId: number;
      value: number;
    }
  | {
      assetId: number;
      bankId: number;
      date: string;
      description: string;
      id: number;
      table: "fin_assets_entries";
      typeId: number;
      value: number;
    };

export type FinanceEntryTableRow = {
  amount: string;
  bank: string;
  bankId: number;
  category: string;
  categoryId: number;
  date: string;
  description: string;
  id: number;
  rawDate: string;
  rawValue: number;
  table: "fin_entries";
  type: string;
  typeId: number;
};

export type FinanceAssetEntryTableRow = {
  amount: string;
  asset: string;
  assetId: number;
  bank: string;
  bankId: number;
  date: string;
  description: string;
  id: number;
  rawDate: string;
  rawValue: number;
  table: "fin_assets_entries";
  type: string;
  typeId: number;
};

function formatCurrencyFromCents(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value / 100);
}

function formatEntryDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

async function getSelectOptionLabelMap(optionIds: number[]) {
  const { user, supabase } = await getSupabaseConfig();
  const uniqueIds = Array.from(new Set(optionIds));

  if (uniqueIds.length === 0) {
    return new Map<number, string>();
  }

  const { data, error } = await supabase
    .from("selects_options")
    .select("id, label")
    .eq("user_id", user.id)
    .in("id", uniqueIds);

  if (error) throw error;

  return new Map((data ?? []).map((option) => [option.id, option.label]));
}

export async function getFinanceEntries(): Promise<FinanceEntry[]> {
  const { user, supabase } = await getSupabaseConfig();

  const { data, error } = await supabase
    .from("fin_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function getFinanceEntryTableRows(): Promise<FinanceEntryTableRow[]> {
  const entries = await getFinanceEntries();
  const labelMap = await getSelectOptionLabelMap(
    entries.flatMap((entry) => [entry.bank, entry.type, entry.category])
  );

  return entries.map((entry) => ({
    amount: formatCurrencyFromCents(entry.value),
    bank: labelMap.get(entry.bank) ?? String(entry.bank),
    bankId: entry.bank,
    category: labelMap.get(entry.category) ?? String(entry.category),
    categoryId: entry.category,
    date: formatEntryDate(entry.date),
    description: entry.description,
    id: entry.id,
    rawDate: entry.date,
    rawValue: entry.value,
    table: "fin_entries",
    type: labelMap.get(entry.type) ?? String(entry.type),
    typeId: entry.type,
  }));
}

export async function createFinanceEntry(input: {
  bankId: number;
  categoryId: number;
  date: string;
  description: string;
  typeId: number;
  value: number;
}): Promise<FinanceEntry> {
  const { user, supabase } = await getSupabaseConfig();

  const { data, error } = await supabase
    .from("fin_entries")
    .insert({
      bank: input.bankId,
      category: input.categoryId,
      date: input.date,
      description: input.description,
      type: input.typeId,
      user_id: user.id,
      value: input.value,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function updateFinanceEntry(input: {
  bankId: number;
  categoryId: number;
  date: string;
  description: string;
  id: number;
  typeId: number;
  value: number;
}): Promise<FinanceEntry> {
  const { user, supabase } = await getSupabaseConfig();

  const { data, error } = await supabase
    .from("fin_entries")
    .update({
      bank: input.bankId,
      category: input.categoryId,
      date: input.date,
      description: input.description,
      type: input.typeId,
      updated_at: new Date().toISOString(),
      value: input.value,
    })
    .eq("user_id", user.id)
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function createFinanceAssetEntry(input: {
  assetId: number;
  bankId: number;
  date: string;
  description: string;
  typeId: number;
  value: number;
}): Promise<FinanceAssetEntry> {
  const { user, supabase } = await getSupabaseConfig();

  const { data, error } = await supabase
    .from("fin_assets_entries")
    .insert({
      asset_id: input.assetId,
      bank: input.bankId,
      date: input.date,
      description: input.description,
      type: input.typeId,
      user_id: user.id,
      value: input.value,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function updateFinanceAssetEntry(input: {
  assetId: number;
  bankId: number;
  date: string;
  description: string;
  id: number;
  typeId: number;
  value: number;
}): Promise<FinanceAssetEntry> {
  const { user, supabase } = await getSupabaseConfig();

  const { data, error } = await supabase
    .from("fin_assets_entries")
    .update({
      asset_id: input.assetId,
      bank: input.bankId,
      date: input.date,
      description: input.description,
      type: input.typeId,
      updated_at: new Date().toISOString(),
      value: input.value,
    })
    .eq("user_id", user.id)
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function getFinanceAssetEntries(): Promise<FinanceAssetEntry[]> {
  const { user, supabase } = await getSupabaseConfig();

  const { data, error } = await supabase
    .from("fin_assets_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function getFinanceAssetEntryTableRows(): Promise<
  FinanceAssetEntryTableRow[]
> {
  const { user, supabase } = await getSupabaseConfig();
  const entries = await getFinanceAssetEntries();
  const labelMap = await getSelectOptionLabelMap(
    entries.flatMap((entry) => [entry.bank, entry.type])
  );
  const assetIds = Array.from(new Set(entries.map((entry) => entry.asset_id)));

  const assetLabelById = new Map<number, string>();

  if (assetIds.length > 0) {
    const { data: assets, error: assetsError } = await supabase
      .from("fin_assets")
      .select("id, ticker")
      .eq("user_id", user.id)
      .in("id", assetIds);

    if (assetsError) throw assetsError;

    for (const asset of assets ?? []) {
      assetLabelById.set(asset.id, asset.ticker);
    }
  }

  return entries.map((entry) => ({
    amount: formatCurrencyFromCents(entry.value),
    asset: assetLabelById.get(entry.asset_id) ?? String(entry.asset_id),
    assetId: entry.asset_id,
    bank: labelMap.get(entry.bank) ?? String(entry.bank),
    bankId: entry.bank,
    date: formatEntryDate(entry.date),
    description: entry.description,
    id: entry.id,
    rawDate: entry.date,
    rawValue: entry.value,
    table: "fin_assets_entries",
    type: labelMap.get(entry.type) ?? String(entry.type),
    typeId: entry.type,
  }));
}
