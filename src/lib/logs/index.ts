import { getSupabaseConfig } from "../queries";

type LogLevel = "info" | "warn" | "error";

export async function createLog({
  level,
  context,
  message,
  metadata,
}: {
  level: LogLevel;
  context: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const { user, supabase } = await getSupabaseConfig();

  const { error } = await supabase.from("logs").insert({
    user_id: user.id,
    level,
    context,
    message,
    metadata: serializeError(metadata) ?? null,
  });

  if (error) {
    console.error("Erro ao salvar log:", error);
  }
}


export function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
}