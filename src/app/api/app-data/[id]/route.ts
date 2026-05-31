import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);

  if (!id) {
    return jsonError("Missing row id.", 400);
  }

  if (!isRecord(body) || !isRecord(body.data)) {
    return jsonError("Missing row data.", 400);
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return jsonError("You must be signed in.", 401);
  }

  const { data, error } = await supabase
    .from("app_data")
    .update({ data: body.data })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return jsonError("Could not update row.", 500);
  }

  if (!data) {
    return jsonError("Row not found.", 404);
  }

  return NextResponse.json({ data, error: null });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return jsonError("Missing row id.", 400);
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return jsonError("You must be signed in.", 401);
  }

  const { data, error } = await supabase
    .from("app_data")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return jsonError("Could not delete row.", 500);
  }

  if (!data) {
    return jsonError("Row not found.", 404);
  }

  return NextResponse.json({ data, error: null });
}
