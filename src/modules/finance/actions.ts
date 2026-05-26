"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getFinanceEntryInput(formData: FormData) {
  const date = getString(formData, "date");
  const description = getString(formData, "description");
  const amount = Number(getString(formData, "amount"));
  const bank = Number(formData.get("bank"));
  const type = Number(formData.get("type"));

  if (!date || !description || !Number.isFinite(amount)) {
    throw new Error("Date, description, and amount are required.");
  }

  if (!Number.isInteger(bank) || !Number.isInteger(type)) {
    throw new Error("Bank and type must be valid select options.");
  }

  return {
    date,
    amount,
    description,
    bank,
    type,
  };
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

export async function createFinanceEntry(formData: FormData) {
  const entry = getFinanceEntryInput(formData);

  await Promise.all([
    assertSelectOption("bank", entry.bank),
    assertSelectOption("entry_type", entry.type),
  ]);

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
    .eq("table_id", "finances_entries")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    throw positionError;
  }

  const { error } = await supabase.from("app_data").insert({
    user_id: user.id,
    table_id: "finances_entries",
    position: (lastRow?.position ?? -1) + 1,
    data: entry,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/finance");
}

export async function updateFinanceEntry(formData: FormData) {
  const id = getString(formData, "id");
  const entry = getFinanceEntryInput(formData);

  if (!id) {
    throw new Error("Finance entry id is required.");
  }

  await Promise.all([
    assertSelectOption("bank", entry.bank),
    assertSelectOption("entry_type", entry.type),
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
    .eq("table_id", "finances_entries")
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/finance");
}

export async function duplicateFinanceEntry(id: string) {
  if (!id) {
    throw new Error("Finance entry id is required.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const [{ data: entry, error: entryError }, { data: lastRow, error: positionError }] =
    await Promise.all([
      supabase
        .from("app_data")
        .select("data")
        .eq("table_id", "finances_entries")
        .eq("id", id)
        .single(),
      supabase
        .from("app_data")
        .select("position")
        .eq("table_id", "finances_entries")
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (entryError) {
    throw entryError;
  }

  if (positionError) {
    throw positionError;
  }

  const { error } = await supabase.from("app_data").insert({
    user_id: user.id,
    table_id: "finances_entries",
    position: (lastRow?.position ?? -1) + 1,
    data: entry.data,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/finance");
}

export async function deleteFinanceEntry(id: string) {
  if (!id) {
    throw new Error("Finance entry id is required.");
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
    .eq("table_id", "finances_entries")
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/finance");
}
