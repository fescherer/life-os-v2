import { getSupabaseConfig } from "@/lib/queries";
import type { Tables } from "@/types/supabase";

export type FinanceAsset = Tables<"fin_assets">;

export type FinanceAssetOption = {
  assetTypeId: number;
  description: string;
  eyebrow: string;
  id: number;
  label: string;
  value: string;
};

export type FinanceAssetDeletePreview = {
  canDelete: boolean;
  optionId: number;
  optionLabel: string;
  usageCount: number;
};

function dedupeFinanceAssetsByTicker(assets: FinanceAssetOption[]) {
  const uniqueAssets = new Map<string, FinanceAssetOption>();

  for (const asset of assets) {
    const existingAsset = uniqueAssets.get(asset.value);

    if (!existingAsset || asset.id < existingAsset.id) {
      uniqueAssets.set(asset.value, asset);
    }
  }

  return Array.from(uniqueAssets.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

export async function getFinanceAssets(): Promise<FinanceAssetOption[]> {
  const { user, supabase } = await getSupabaseConfig();

  const { data, error } = await supabase
    .from("fin_assets")
    .select("id, ticker, name, type")
    .eq("user_id", user.id)
    .order("ticker", { ascending: true });

  if (error) throw error;

  const typeIds = Array.from(new Set((data ?? []).map((asset) => asset.type)));
  const typeLabelById = new Map<number, string>();

  if (typeIds.length > 0) {
    const { data: typeOptions, error: typeOptionsError } = await supabase
      .from("selects_options")
      .select("id, label")
      .eq("user_id", user.id)
      .in("id", typeIds);

    if (typeOptionsError) throw typeOptionsError;

    for (const option of typeOptions ?? []) {
      typeLabelById.set(option.id, option.label);
    }
  }

  return dedupeFinanceAssetsByTicker(
    (data ?? []).map((asset) => ({
      assetTypeId: asset.type,
      description: asset.name,
      id: asset.id,
      label: asset.ticker,
      value: asset.ticker.toLowerCase(),
      eyebrow: typeLabelById.get(asset.type) ?? "",
    }))
  );
}

export async function createFinanceAsset(input: {
  name: string;
  ticker: string;
  typeId: number;
}): Promise<FinanceAssetOption> {
  const { user, supabase } = await getSupabaseConfig();
  const normalizedTicker = input.ticker.trim().toUpperCase();
  const normalizedName = input.name.trim();

  if (!normalizedTicker) {
    throw new Error("Informe o ticker do ativo.");
  }

  if (!normalizedName) {
    throw new Error("Informe o nome do ativo.");
  }

  const { data: existingAsset, error: existingAssetError } = await supabase
    .from("fin_assets")
    .select("id, ticker, name, type")
    .eq("user_id", user.id)
    .eq("ticker", normalizedTicker)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingAssetError) throw existingAssetError;

  let asset = existingAsset;

  if (!asset) {
    const { data: createdAsset, error: createAssetError } = await supabase
      .from("fin_assets")
      .insert({
        name: normalizedName,
        ticker: normalizedTicker,
        type: input.typeId,
        user_id: user.id,
      })
      .select("id, ticker, name, type")
      .single();

    if (createAssetError) throw createAssetError;

    asset = createdAsset;
  }

  if (!asset) {
    throw new Error("Nao foi possivel salvar o ativo.");
  }

  const { data: typeOption, error: typeOptionError } = await supabase
    .from("selects_options")
    .select("label")
    .eq("user_id", user.id)
    .eq("id", asset.type)
    .single();

  if (typeOptionError) throw typeOptionError;

  return {
    assetTypeId: asset.type,
    description: asset.name,
    id: asset.id,
    label: asset.ticker,
    value: asset.ticker.toLowerCase(),
    eyebrow: typeOption.label,
  };
}

export async function previewFinanceAssetDeletion(input: {
  assetId: number;
}): Promise<FinanceAssetDeletePreview> {
  const { user, supabase } = await getSupabaseConfig();

  const { data: asset, error: assetError } = await supabase
    .from("fin_assets")
    .select("id, ticker")
    .eq("user_id", user.id)
    .eq("id", input.assetId)
    .single();

  if (assetError) throw assetError;

  const { count, error: usageError } = await supabase
    .from("fin_assets_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("asset_id", input.assetId);

  if (usageError) throw usageError;

  const usageCount = count ?? 0;

  return {
    canDelete: usageCount === 0,
    optionId: asset.id,
    optionLabel: asset.ticker,
    usageCount,
  };
}

export async function deleteFinanceAsset(input: {
  assetId: number;
}): Promise<FinanceAssetDeletePreview> {
  const preview = await previewFinanceAssetDeletion(input);

  if (!preview.canDelete) {
    throw new Error("Esse ativo ainda esta sendo usado e nao pode ser excluido.");
  }

  const { user, supabase } = await getSupabaseConfig();

  const { error } = await supabase
    .from("fin_assets")
    .delete()
    .eq("user_id", user.id)
    .eq("id", input.assetId);

  if (error) throw error;

  return preview;
}
