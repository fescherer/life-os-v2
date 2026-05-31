import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

export async function GET(request: NextRequest) {
  const tableId = request.nextUrl.searchParams.get("tableId");

  if (!tableId) {
    return jsonError("Missing tableId.", 400);
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return jsonError("You must be signed in.", 401);
  }

  const { data, error } = await supabase
    .from("app_data")
    .select("*")
    .eq("table_id", tableId)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return jsonError("Could not load rows.", 500);
  }

  return NextResponse.json({ data: data ?? [], error: null });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isRecord(body) || typeof body.tableId !== "string") {
    return jsonError("Missing tableId.", 400);
  }

  if (!isRecord(body.data)) {
    return jsonError("Missing row data.", 400);
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return jsonError("You must be signed in.", 401);
  }

  const { data, error } = await supabase
    .from("app_data")
    .insert({
      user_id: user.id,
      table_id: body.tableId,
      data: body.data,
    })
    .select("*")
    .single();

  if (error) {
    return jsonError("Could not create row.", 500);
  }

  return NextResponse.json({ data, error: null }, { status: 201 });
}
