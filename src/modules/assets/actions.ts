"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function assertSelectOption(selectIdentifier: string, id: number) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("select_options")
    .select("id")
    .eq("select_identifier", selectIdentifier)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Invalid ${selectIdentifier} option.`);
  }
}

async function assertAsset(id: number) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("app_data")
    .select("id")
    .eq("table_id", "assets")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error("Invalid asset.");
  }
}

async function insertAppData(tableId: string, data: Record<string, unknown>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const { data: lastRow, error: positionError } = await supabase
    .from("app_data")
    .select("position")
    .eq("table_id", tableId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    throw positionError;
  }

  const { error } = await supabase.from("app_data").insert({
    user_id: user.id,
    table_id: tableId,
    position: (lastRow?.position ?? -1) + 1,
    data,
  });

  if (error) {
    throw error;
  }
}

function getAssetInput(formData: FormData) {
  const name = getString(formData, "name");
  const ticker = getString(formData, "ticker").toUpperCase();
  const assetType = Number(formData.get("asset_type"));

  if (!name || !ticker) {
    throw new Error("Asset name and ticker are required.");
  }

  if (!Number.isInteger(assetType)) {
    throw new Error("Asset type must be a valid select option.");
  }

  return {
    name,
    ticker,
    asset_type: assetType,
  };
}

function getAssetEntryInput(formData: FormData) {
  const date = getString(formData, "date");
  const value = Number(getString(formData, "value"));
  const assetId = Number(formData.get("asset_id"));
  const bank = Number(formData.get("bank"));
  const type = Number(formData.get("type"));

  if (!date || !Number.isFinite(value) || !Number.isInteger(assetId)) {
    throw new Error("Date, value, and asset are required.");
  }

  if (!Number.isInteger(bank) || !Number.isInteger(type)) {
    throw new Error("Bank and type must be valid select options.");
  }

  return {
    date,
    value,
    bank,
    type,
    asset_id: assetId,
  };
}

export async function createAsset(formData: FormData) {
  const asset = getAssetInput(formData);

  await assertSelectOption("asset_type", asset.asset_type);
  await insertAppData("assets", asset);

  revalidatePath("/finance-assets");
}

export async function updateAsset(formData: FormData) {
  const id = getString(formData, "id");
  const asset = getAssetInput(formData);

  if (!id) {
    throw new Error("Asset id is required.");
  }

  await assertSelectOption("asset_type", asset.asset_type);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const { error } = await supabase
    .from("app_data")
    .update({ data: asset })
    .eq("table_id", "assets")
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/finance-assets");
}

export async function deleteAsset(id: string) {
  if (!id) {
    throw new Error("Asset id is required.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const { error: entriesError } = await supabase
    .from("app_data")
    .delete()
    .eq("table_id", "assets_entries")
    .filter("data->>asset_id", "eq", String(id));

  if (entriesError) {
    throw entriesError;
  }

  const { error } = await supabase
    .from("app_data")
    .delete()
    .eq("table_id", "assets")
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/finance-assets");
}

export async function createAssetEntry(formData: FormData) {
  const entry = getAssetEntryInput(formData);

  await Promise.all([
    assertAsset(entry.asset_id),
    assertSelectOption("bank", entry.bank),
    assertSelectOption("asset_entry_type", entry.type),
  ]);

  await insertAppData("assets_entries", entry);

  revalidatePath("/finance-assets");
}

export async function updateAssetEntry(formData: FormData) {
  const id = getString(formData, "id");
  const entry = getAssetEntryInput(formData);

  if (!id) {
    throw new Error("Asset entry id is required.");
  }

  await Promise.all([
    assertAsset(entry.asset_id),
    assertSelectOption("bank", entry.bank),
    assertSelectOption("asset_entry_type", entry.type),
  ]);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const { error } = await supabase
    .from("app_data")
    .update({ data: entry })
    .eq("table_id", "assets_entries")
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/finance-assets");
}

export async function deleteAssetEntry(id: string) {
  if (!id) {
    throw new Error("Asset entry id is required.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const { error } = await supabase
    .from("app_data")
    .delete()
    .eq("table_id", "assets_entries")
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/finance-assets");
}
