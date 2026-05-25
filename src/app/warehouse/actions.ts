"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { WarehouseBox, WarehouseItem } from "@/types/warehouse";
import { revalidatePath } from "next/cache";

const WAREHOUSE_TABLE_ID = "warehouse_boxes";

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

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function normalizeBox(data: unknown): WarehouseBox {
  const boxData = data as Partial<WarehouseBox>;

  return {
    name: typeof boxData.name === "string" ? boxData.name : "BOX",
    coverUrl:
      typeof boxData.coverUrl === "string" ? boxData.coverUrl : undefined,
    items: Array.isArray(boxData.items) ? boxData.items : [],
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

async function getWarehouseBox(boxId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_data")
    .select("data")
    .eq("table_id", WAREHOUSE_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", boxId)
    .single();

  if (error) {
    throw error;
  }

  return normalizeBox(data.data);
}

export async function createWarehouseBox(formData: FormData) {
  const name = getString(formData, "name");
  const { supabase, userId } = await getAuthenticatedSupabase();

  const { data: lastRow, error: positionError } = await supabase
    .from("app_data")
    .select("position")
    .eq("table_id", WAREHOUSE_TABLE_ID)
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
      table_id: WAREHOUSE_TABLE_ID,
      position: (lastRow?.position ?? -1) + 1,
      data: {
        name: name || `BOX ${(lastRow?.position ?? -1) + 2}`,
        items: [],
      } satisfies WarehouseBox,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  revalidatePath("/warehouse");

  return data.id as string;
}

export async function renameWarehouseBox(formData: FormData) {
  const id = getString(formData, "id");
  const name = getString(formData, "name");
  const coverUrl = getCoverUrl(formData);

  if (!id || !name) {
    throw new Error("Box id and name are required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const currentBox = await getWarehouseBox(id, userId);
  const { error } = await supabase
    .from("app_data")
    .update({
      data: { ...currentBox, name, coverUrl } satisfies WarehouseBox,
    })
    .eq("table_id", WAREHOUSE_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/warehouse");
}

export async function deleteWarehouseBox(id: string) {
  if (!id) {
    throw new Error("Box id is required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("app_data")
    .delete()
    .eq("table_id", WAREHOUSE_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/warehouse");
}

export async function createWarehouseItem(formData: FormData) {
  const boxId = getString(formData, "boxId");
  const text = getString(formData, "text");

  if (!boxId || !text) {
    throw new Error("Box id and item text are required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const currentBox = await getWarehouseBox(boxId, userId);
  const nextItem: WarehouseItem = {
    id: createId("item"),
    text,
  };
  const { error } = await supabase
    .from("app_data")
    .update({
      data: {
        ...currentBox,
        items: [...currentBox.items, nextItem],
      } satisfies WarehouseBox,
    })
    .eq("table_id", WAREHOUSE_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", boxId);

  if (error) {
    throw error;
  }

  revalidatePath("/warehouse");
}

export async function deleteWarehouseItem(boxId: string, itemId: string) {
  if (!boxId || !itemId) {
    throw new Error("Box id and item id are required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const currentBox = await getWarehouseBox(boxId, userId);
  const { error } = await supabase
    .from("app_data")
    .update({
      data: {
        ...currentBox,
        items: currentBox.items.filter((item) => item.id !== itemId),
      } satisfies WarehouseBox,
    })
    .eq("table_id", WAREHOUSE_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", boxId);

  if (error) {
    throw error;
  }

  revalidatePath("/warehouse");
}
