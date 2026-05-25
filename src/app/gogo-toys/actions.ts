"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  GogoCollection,
  GogoCollectionItem,
  GogoPurchase,
} from "@/types/gogo";
import { revalidatePath } from "next/cache";

const GOGO_COLLECTIONS_TABLE_ID = "gogo_collections";
const GOGO_PURCHASES_TABLE_ID = "gogo_purchases";
const STORE_SELECT_ID = "store";
const GOGO_COLOR_TYPE_SELECT_ID = "gogo_color_type";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getCoverUrl(formData: FormData) {
  const coverUrl = getString(formData, "coverUrl");

  if (!coverUrl) {
    return undefined;
  }

  try {
    const url = new URL(coverUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Cover URL must start with http or https.");
    }

    return coverUrl;
  } catch {
    throw new Error("Cover URL must be a valid http or https URL.");
  }
}

function getOptionalUrl(formData: FormData, key: string, label: string) {
  const value = getString(formData, key);

  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error(`${label} must start with http or https.`);
    }

    return value;
  } catch {
    throw new Error(`${label} must be a valid http or https URL.`);
  }
}

function getNumber(formData: FormData, key: string) {
  return Number(getString(formData, key));
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function normalizeCollection(data: unknown): GogoCollection {
  const collection = data as Partial<GogoCollection>;

  return {
    name: typeof collection.name === "string" ? collection.name : "Collection",
    coverUrl:
      typeof collection.coverUrl === "string"
        ? collection.coverUrl
        : undefined,
    items: Array.isArray(collection.items) ? collection.items : [],
  };
}

async function getAuthenticatedSupabase() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  return { supabase, userId: user.id };
}

async function assertSelectOption(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  selectIdentifier: string,
  value: string,
) {
  const { error } = await supabase
    .from("select_options")
    .select("id")
    .eq("user_id", userId)
    .eq("select_identifier", selectIdentifier)
    .eq("value", value)
    .limit(1)
    .single();

  if (error) {
    throw new Error(`Invalid ${selectIdentifier} option.`);
  }
}

async function getCollection(collectionId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_data")
    .select("data")
    .eq("table_id", GOGO_COLLECTIONS_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", collectionId)
    .single();

  if (error) {
    throw error;
  }

  return normalizeCollection(data.data);
}

export async function createGogoCollection(formData: FormData) {
  const name = getString(formData, "name");
  const { supabase, userId } = await getAuthenticatedSupabase();
  const { data: lastRow, error: positionError } = await supabase
    .from("app_data")
    .select("position")
    .eq("table_id", GOGO_COLLECTIONS_TABLE_ID)
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    throw positionError;
  }

  const { data, error } = await supabase
    .from("app_data")
    .insert({
      user_id: userId,
      table_id: GOGO_COLLECTIONS_TABLE_ID,
      position: (lastRow?.position ?? -1) + 1,
      data: {
        name: name || `Collection ${(lastRow?.position ?? -1) + 2}`,
        items: [],
      } satisfies GogoCollection,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  revalidatePath("/gogo-toys");

  return data.id as string;
}

export async function renameGogoCollection(formData: FormData) {
  const id = getString(formData, "id");
  const name = getString(formData, "name");
  const coverUrl = getCoverUrl(formData);

  if (!id || !name) {
    throw new Error("Collection id and name are required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const currentCollection = await getCollection(id, userId);
  const { error } = await supabase
    .from("app_data")
    .update({
      data: { ...currentCollection, name, coverUrl } satisfies GogoCollection,
    })
    .eq("table_id", GOGO_COLLECTIONS_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/gogo-toys");
}

export async function deleteGogoCollection(id: string) {
  if (!id) {
    throw new Error("Collection id is required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("app_data")
    .delete()
    .eq("table_id", GOGO_COLLECTIONS_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/gogo-toys");
}

export async function createGogoCollectionItem(formData: FormData) {
  const collectionId = getString(formData, "collectionId");
  const color = getString(formData, "color") || "#71717a";
  const colorText = getString(formData, "colorText");
  const colorType = getString(formData, "colorType");
  const imageUrl = getOptionalUrl(formData, "imageUrl", "Image URL");
  const quantity = getNumber(formData, "quantity");

  if (!collectionId || !colorText || !colorType || !Number.isFinite(quantity)) {
    throw new Error("Color, color type, and quantity are required.");
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error("Color must be a valid hex color.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();

  await assertSelectOption(
    supabase,
    userId,
    GOGO_COLOR_TYPE_SELECT_ID,
    colorType,
  );

  const currentCollection = await getCollection(collectionId, userId);
  const nextItem: GogoCollectionItem = {
    id: createId("gogo-item"),
    color,
    colorText,
    colorType,
    imageUrl,
    quantity,
  };
  const { error } = await supabase
    .from("app_data")
    .update({
      data: {
        ...currentCollection,
        items: [...currentCollection.items, nextItem],
      } satisfies GogoCollection,
    })
    .eq("table_id", GOGO_COLLECTIONS_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", collectionId);

  if (error) {
    throw error;
  }

  revalidatePath("/gogo-toys");
}

export async function updateGogoCollectionItemQuantity(
  collectionId: string,
  itemId: string,
  quantity: number,
) {
  if (!collectionId || !itemId || !Number.isFinite(quantity)) {
    throw new Error("Collection id, item id, and quantity are required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const currentCollection = await getCollection(collectionId, userId);
  const { error } = await supabase
    .from("app_data")
    .update({
      data: {
        ...currentCollection,
        items: currentCollection.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        ),
      } satisfies GogoCollection,
    })
    .eq("table_id", GOGO_COLLECTIONS_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", collectionId);

  if (error) {
    throw error;
  }

  revalidatePath("/gogo-toys");
}

export async function deleteGogoCollectionItem(
  collectionId: string,
  itemId: string,
) {
  if (!collectionId || !itemId) {
    throw new Error("Collection id and item id are required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const currentCollection = await getCollection(collectionId, userId);
  const { error } = await supabase
    .from("app_data")
    .update({
      data: {
        ...currentCollection,
        items: currentCollection.items.filter((item) => item.id !== itemId),
      } satisfies GogoCollection,
    })
    .eq("table_id", GOGO_COLLECTIONS_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", collectionId);

  if (error) {
    throw error;
  }

  revalidatePath("/gogo-toys");
}

export async function createGogoPurchase(formData: FormData) {
  const purchase: GogoPurchase = {
    date: getString(formData, "date"),
    description: getString(formData, "description"),
    price: getNumber(formData, "price"),
    store: getString(formData, "store"),
  };

  if (
    !purchase.date ||
    !purchase.description ||
    !purchase.store ||
    !Number.isFinite(purchase.price)
  ) {
    throw new Error("Date, description, price, and store are required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();

  await assertSelectOption(supabase, userId, STORE_SELECT_ID, purchase.store);

  const { data: lastRow, error: positionError } = await supabase
    .from("app_data")
    .select("position")
    .eq("table_id", GOGO_PURCHASES_TABLE_ID)
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    throw positionError;
  }

  const { error } = await supabase.from("app_data").insert({
    user_id: userId,
    table_id: GOGO_PURCHASES_TABLE_ID,
    position: (lastRow?.position ?? -1) + 1,
    data: purchase,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/gogo-toys");
}

export async function deleteGogoPurchase(id: string) {
  if (!id) {
    throw new Error("Purchase id is required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("app_data")
    .delete()
    .eq("table_id", GOGO_PURCHASES_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/gogo-toys");
}
