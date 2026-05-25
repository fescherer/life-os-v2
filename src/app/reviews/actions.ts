"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Review } from "@/types/review";
import { revalidatePath } from "next/cache";

const REVIEWS_TABLE_ID = "reviews";
const REVIEW_TYPE_SELECT_ID = "review_type";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getIsoDate(formData: FormData, key: string) {
  const value = getString(formData, key);

  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Dates must be valid.");
  }

  return date.toISOString();
}

function getReviewStars(formData: FormData) {
  const value = Number(getString(formData, "review_stars"));

  if (!Number.isInteger(value) || value < 0 || value > 20) {
    throw new Error("Stars must be a whole number from 0 to 20.");
  }

  return value;
}

function getReviewInput(formData: FormData): Review {
  const review_date = getIsoDate(formData, "review_date");
  const finished_date = getIsoDate(formData, "finished_date");
  const type = getString(formData, "type");
  const title = getString(formData, "title");
  const cover_image = getString(formData, "cover_image");
  const review = getString(formData, "review");
  const review_stars = getReviewStars(formData);

  if (!review_date || !finished_date || !type || !title) {
    throw new Error("Review date, finished date, type, and title are required.");
  }

  return {
    review_date,
    finished_date,
    type,
    title,
    cover_image: cover_image || undefined,
    review,
    review_stars,
  };
}

async function assertReviewTypeOption(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  type: string,
) {
  const { error } = await supabase
    .from("select_options")
    .select("id")
    .eq("user_id", userId)
    .eq("select_identifier", REVIEW_TYPE_SELECT_ID)
    .eq("value", type)
    .limit(1)
    .single();

  if (error) {
    throw new Error("Type must be a configured review type option.");
  }
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

export async function createReview(formData: FormData) {
  const review = getReviewInput(formData);
  const { supabase, userId } = await getAuthenticatedUserId();

  await assertReviewTypeOption(supabase, userId, review.type);

  const { data: lastRow, error: positionError } = await supabase
    .from("app_data")
    .select("position")
    .eq("table_id", REVIEWS_TABLE_ID)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    throw positionError;
  }

  const { error } = await supabase.from("app_data").insert({
    user_id: userId,
    table_id: REVIEWS_TABLE_ID,
    position: (lastRow?.position ?? -1) + 1,
    data: review,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/reviews");
}

export async function updateReview(formData: FormData) {
  const id = getString(formData, "id");
  const review = getReviewInput(formData);

  if (!id) {
    throw new Error("Review id is required.");
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  await assertReviewTypeOption(supabase, userId, review.type);

  const { error } = await supabase
    .from("app_data")
    .update({ data: review })
    .eq("table_id", REVIEWS_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/reviews");
}

export async function deleteReview(id: string) {
  if (!id) {
    throw new Error("Review id is required.");
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase
    .from("app_data")
    .delete()
    .eq("table_id", REVIEWS_TABLE_ID)
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/reviews");
}
