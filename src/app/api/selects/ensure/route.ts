import {
  ensureSelectsCreation,
  getSelectsWithOptions,
} from "@/lib/queries/selects";

export async function GET() {
  try {
    const selects = await getSelectsWithOptions();

    return Response.json({ selects });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar selects";

    console.error("GET /api/selects/ensure failed:", error);

    return Response.json({ ok: false, message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const selects = await getSelectsWithOptions();
    const hadSelects = selects.length > 0;

    await ensureSelectsCreation();

    return Response.json({ ok: true, created: !hadSelects });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao configurar conta";

    console.error("POST /api/selects/ensure failed:", error);

    return Response.json({ ok: false, message, error }, { status: 500 });
  }
}
