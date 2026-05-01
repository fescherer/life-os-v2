import {
  createFinanceAssetEntry,
  createFinanceEntry,
  getFinanceAssetEntryTableRows,
  getFinanceEntryTableRows,
  updateFinanceAssetEntry,
  updateFinanceEntry,
} from "@/queries/finances/entries";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const finances =
      table === "fin_assets_entries"
        ? await getFinanceAssetEntryTableRows()
        : await getFinanceEntryTableRows();

    return Response.json(finances);
  } catch (error) {
    const message = getErrorMessage(error, "Erro ao buscar lancamentos financeiros");

    console.error("GET /api/finances failed:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.table === "fin_entries") {
      if (
        typeof body.bankId !== "number" ||
        typeof body.categoryId !== "number" ||
        typeof body.typeId !== "number" ||
        typeof body.value !== "number" ||
        typeof body.date !== "string"
      ) {
        return Response.json({ error: "Dados do lancamento invalidos." }, { status: 400 });
      }

      const entry = await createFinanceEntry({
        bankId: body.bankId,
        categoryId: body.categoryId,
        date: body.date,
        description:
          typeof body.description === "string" ? body.description.trim() : "",
        typeId: body.typeId,
        value: body.value,
      });

      return Response.json(entry, { status: 201 });
    }

    if (body.table === "fin_assets_entries") {
      if (
        typeof body.assetId !== "number" ||
        typeof body.bankId !== "number" ||
        typeof body.typeId !== "number" ||
        typeof body.value !== "number" ||
        typeof body.date !== "string"
      ) {
        return Response.json(
          { error: "Dados da movimentacao de ativo invalidos." },
          { status: 400 }
        );
      }

      const entry = await createFinanceAssetEntry({
        assetId: body.assetId,
        bankId: body.bankId,
        date: body.date,
        description:
          typeof body.description === "string" ? body.description.trim() : "",
        typeId: body.typeId,
        value: body.value,
      });

      return Response.json(entry, { status: 201 });
    }

    return Response.json({ error: "Tabela invalida." }, { status: 400 });
  } catch (error) {
    const message = getErrorMessage(error, "Erro ao criar lancamento financeiro");

    console.error("POST /api/finances failed:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (body.table === "fin_entries") {
      if (
        typeof body.id !== "number" ||
        typeof body.bankId !== "number" ||
        typeof body.categoryId !== "number" ||
        typeof body.typeId !== "number" ||
        typeof body.value !== "number" ||
        typeof body.date !== "string"
      ) {
        return Response.json({ error: "Dados do lancamento invalidos." }, { status: 400 });
      }

      const entry = await updateFinanceEntry({
        bankId: body.bankId,
        categoryId: body.categoryId,
        date: body.date,
        description:
          typeof body.description === "string" ? body.description.trim() : "",
        id: body.id,
        typeId: body.typeId,
        value: body.value,
      });

      return Response.json(entry);
    }

    if (body.table === "fin_assets_entries") {
      if (
        typeof body.id !== "number" ||
        typeof body.assetId !== "number" ||
        typeof body.bankId !== "number" ||
        typeof body.typeId !== "number" ||
        typeof body.value !== "number" ||
        typeof body.date !== "string"
      ) {
        return Response.json(
          { error: "Dados da movimentacao de ativo invalidos." },
          { status: 400 }
        );
      }

      const entry = await updateFinanceAssetEntry({
        assetId: body.assetId,
        bankId: body.bankId,
        date: body.date,
        description:
          typeof body.description === "string" ? body.description.trim() : "",
        id: body.id,
        typeId: body.typeId,
        value: body.value,
      });

      return Response.json(entry);
    }

    return Response.json({ error: "Tabela invalida." }, { status: 400 });
  } catch (error) {
    const message = getErrorMessage(error, "Erro ao atualizar lancamento financeiro");

    console.error("PATCH /api/finances failed:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
