"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Coin } from "@/types/coin";
import { revalidatePath } from "next/cache";

const COIN_COLLECTION_TABLE_ID = "coin_collection";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function getCoinInput(formData: FormData): Coin {
  const year = getString(formData, "year");
  const name = getString(formData, "name");
  const family = getString(formData, "family");
  const material = getString(formData, "material");

  if (!year || !name || !family || !material) {
    throw new Error("Year, name, family, and material are required.");
  }

  return {
    year,
    name,
    family,
    material,
    description: getString(formData, "description") || undefined,
    numistaId: getString(formData, "numistaId") || undefined,
    imageUrl: getString(formData, "imageUrl") || undefined,
    isCommemorative: getBoolean(formData, "isCommemorative"),
    isOwned: getBoolean(formData, "isOwned"),
  };
}

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  return { supabase, userId: user.id };
}

export async function createCoin(formData: FormData) {
  const coin = getCoinInput(formData);
  const { supabase, userId } = await getAuthenticatedUserId();

  const { data: lastRow, error: positionError } = await supabase
    .from("app_data")
    .select("position")
    .eq("table_id", COIN_COLLECTION_TABLE_ID)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    throw positionError;
  }

  const { error } = await supabase.from("app_data").insert({
    user_id: userId,
    table_id: COIN_COLLECTION_TABLE_ID,
    position: (lastRow?.position ?? -1) + 1,
    data: coin,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/coin-collection");
}

export async function updateCoin(formData: FormData) {
  const id = getString(formData, "id");
  const coin = getCoinInput(formData);

  if (!id) {
    throw new Error("Coin id is required.");
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase
    .from("app_data")
    .update({ data: coin })
    .eq("table_id", COIN_COLLECTION_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/coin-collection");
}

export async function updateCoinOwned(id: string, isOwned: boolean) {
  if (!id) {
    throw new Error("Coin id is required.");
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { data: row, error: rowError } = await supabase
    .from("app_data")
    .select("data")
    .eq("table_id", COIN_COLLECTION_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id)
    .single();

  if (rowError) {
    throw rowError;
  }

  const coin = row.data as Coin;
  const { error } = await supabase
    .from("app_data")
    .update({ data: { ...coin, isOwned } })
    .eq("table_id", COIN_COLLECTION_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/coin-collection");
}

export async function deleteCoin(id: string) {
  if (!id) {
    throw new Error("Coin id is required.");
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase
    .from("app_data")
    .delete()
    .eq("table_id", COIN_COLLECTION_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/coin-collection");
}
