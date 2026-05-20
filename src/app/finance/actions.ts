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

export async function createFinanceEntry(formData: FormData) {
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

  await Promise.all([
    assertSelectOption("bank", bank),
    assertSelectOption("entry_type", type),
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
    data: {
      date,
      amount,
      description,
      bank,
      type,
    },
  });

  if (error) {
    throw error;
  }

  revalidatePath("/finance");
}
