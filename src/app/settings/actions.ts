"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { SELECTS } from "@/lib/selects";
import { revalidatePath } from "next/cache";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createSelectOption(formData: FormData) {
  const selectIdentifier = getString(formData, "select_identifier");
  const value = getString(formData, "value");
  const color = getString(formData, "color") || "#71717a";

  if (!SELECTS.some((select) => select.identifier === selectIdentifier)) {
    throw new Error("Invalid select identifier.");
  }

  if (!value) {
    throw new Error("Option value is required.");
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error("Color must be a valid hex color.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const { error } = await supabase.from("select_options").insert({
    user_id: user.id,
    select_identifier: selectIdentifier,
    value,
    color,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/settings");
}

export async function deleteSelectOption(formData: FormData) {
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id)) {
    throw new Error("Invalid option id.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const { error } = await supabase.from("select_options").delete().eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/settings");
}
