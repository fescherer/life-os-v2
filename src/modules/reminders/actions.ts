"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  REMINDER_FREQUENCIES,
  ReminderEntry,
  ReminderFrequency,
} from "@/modules/reminders/types";
import { revalidatePath } from "next/cache";

const REMINDERS_TABLE_ID = "reminders";
const REMINDER_TYPE_SELECT_ID = "reminder_type";

function revalidateReminderPaths() {
  revalidatePath("/");
  revalidatePath("/reminders");
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
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

function getReminderFrequency(formData: FormData): ReminderFrequency {
  const frequency = getString(formData, "notification_frequency");

  if (!REMINDER_FREQUENCIES.includes(frequency as ReminderFrequency)) {
    throw new Error("Notification frequency is required.");
  }

  return frequency as ReminderFrequency;
}

function getReminderInput(formData: FormData): ReminderEntry {
  const date = getIsoDate(formData);
  const description = getString(formData, "description");
  const reminderType = Number(formData.get("reminder_type"));
  const notificationFrequency = getReminderFrequency(formData);

  if (!description) {
    throw new Error("Description is required.");
  }

  if (!Number.isInteger(reminderType)) {
    throw new Error("Reminder type must be a valid option.");
  }

  return {
    date,
    description,
    reminder_type: reminderType,
    notification_frequency: notificationFrequency,
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

async function assertReminderType(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  id: number,
) {
  const { error } = await supabase
    .from("select_options")
    .select("id")
    .eq("user_id", userId)
    .eq("select_identifier", REMINDER_TYPE_SELECT_ID)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error("Invalid reminder type option.");
  }
}

export async function createReminderEntry(formData: FormData) {
  const entry = getReminderInput(formData);
  const { supabase, userId } = await getAuthenticatedSupabase();

  await assertReminderType(supabase, userId, entry.reminder_type);

  const { data: lastRow, error: positionError } = await supabase
    .from("app_data")
    .select("position")
    .eq("table_id", REMINDERS_TABLE_ID)
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    throw positionError;
  }

  const { error } = await supabase.from("app_data").insert({
    user_id: userId,
    table_id: REMINDERS_TABLE_ID,
    position: (lastRow?.position ?? -1) + 1,
    data: entry,
  });

  if (error) {
    throw error;
  }

  revalidateReminderPaths();
}

export async function updateReminderEntry(formData: FormData) {
  const id = getString(formData, "id");
  const entry = getReminderInput(formData);

  if (!id) {
    throw new Error("Reminder id is required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();

  await assertReminderType(supabase, userId, entry.reminder_type);

  const { error } = await supabase
    .from("app_data")
    .update({ data: entry })
    .eq("table_id", REMINDERS_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidateReminderPaths();
}

export async function deleteReminderEntry(id: string) {
  if (!id) {
    throw new Error("Reminder id is required.");
  }

  const { supabase, userId } = await getAuthenticatedSupabase();
  const { error } = await supabase
    .from("app_data")
    .delete()
    .eq("table_id", REMINDERS_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidateReminderPaths();
}
