"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { PackagingEntry } from "@/modules/packaging/types";
import { revalidatePath } from "next/cache";

const PACKAGING_TABLE_ID = "packaging_tracker";

function revalidatePackagingPaths() {
  revalidatePath("/");
  revalidatePath("/packaging");
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function getIsoDate(formData: FormData) {
  const value = getString(formData, "date");

  if (!value) {
    throw new Error("Date is required.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Date must be valid.");
  }

  return date.toISOString();
}

function getPackagingInput(formData: FormData): PackagingEntry {
  const date = getIsoDate(formData);
  const store = Number(formData.get("store"));
  const description = getString(formData, "description");
  const deliveryCompany = Number(formData.get("delivery_company"));
  const tracking = getString(formData, "tracking");

  if (!description) {
    throw new Error("Description is required.");
  }

  if (!Number.isInteger(store) || !Number.isInteger(deliveryCompany)) {
    throw new Error("Store and delivery company must be valid options.");
  }

  return {
    date,
    store,
    description,
    delivery_company: deliveryCompany,
    tracking,
    has_arrived: getBoolean(formData, "has_arrived"),
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
  id: number,
) {
  const { error } = await supabase
    .from("select_options")
    .select("id")
    .eq("user_id", userId)
    .eq("select_identifier", selectIdentifier)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Invalid ${selectIdentifier} option.`);
  }
}

export async function createPackagingEntry(formData: FormData) {
  const entry = getPackagingInput(formData);
  const { supabase, userId } = await getAuthenticatedSupabase();

  await Promise.all([
    assertSelectOption(supabase, userId, "store", entry.store),
    assertSelectOption(
      supabase,
      userId,
      "delivery_company",
      entry.delivery_company,
    ),
  ]);

  const { data: lastRow, error: positionError } = await supabase
    .from("app_data")
    .select("position")
    .eq("table_id", PACKAGING_TABLE_ID)
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    throw positionError;
  }

  const { error } = await supabase.from("app_data").insert({
    user_id: userId,
    table_id: PACKAGING_TABLE_ID,
    position: (lastRow?.position ?? -1) + 1,
    data: entry,
  });

  if (error) {
    throw error;
  }

  revalidatePackagingPaths();
}

export async function updatePackagingEntry(formData: FormData) {
  const id = getString(formData, "id");
  const entry = getPackagingInput(formData);

  if (!id) {
    throw new Error("Packaging entry id is required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();

  await Promise.all([
    assertSelectOption(supabase, userId, "store", entry.store),
    assertSelectOption(
      supabase,
      userId,
      "delivery_company",
      entry.delivery_company,
    ),
  ]);

  const { error } = await supabase
    .from("app_data")
    .update({ data: entry })
    .eq("table_id", PACKAGING_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePackagingPaths();
}

export async function updatePackagingArrived(id: string, hasArrived: boolean) {
  if (!id) {
    throw new Error("Packaging entry id is required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { data: row, error: rowError } = await supabase
    .from("app_data")
    .select("data")
    .eq("table_id", PACKAGING_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id)
    .single();

  if (rowError) {
    throw rowError;
  }

  const currentEntry = row.data as PackagingEntry;
  const { error } = await supabase
    .from("app_data")
    .update({
      data: {
        ...currentEntry,
        has_arrived: hasArrived,
      } satisfies PackagingEntry,
    })
    .eq("table_id", PACKAGING_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePackagingPaths();
}

export async function deletePackagingEntry(id: string) {
  if (!id) {
    throw new Error("Packaging entry id is required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("app_data")
    .delete()
    .eq("table_id", PACKAGING_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePackagingPaths();
}
