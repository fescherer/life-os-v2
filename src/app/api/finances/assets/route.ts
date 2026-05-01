import {
  createFinanceAsset,
  deleteFinanceAsset,
  getFinanceAssets,
  previewFinanceAssetDeletion,
} from "@/queries/finances/assets";

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

export async function GET() {
  try {
    const assets = await getFinanceAssets();

    return Response.json(assets);
  } catch (error) {
    const message = getErrorMessage(error, "Erro ao buscar ativos financeiros");

    console.error("GET /api/finances/assets failed:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (typeof body.ticker !== "string" || typeof body.name !== "string") {
      return Response.json({ error: "Dados do ativo invalidos." }, { status: 400 });
    }

    if (typeof body.typeId !== "number") {
      return Response.json({ error: "Tipo do ativo invalido." }, { status: 400 });
    }

    const asset = await createFinanceAsset({
      name: body.name,
      ticker: body.ticker,
      typeId: body.typeId,
    });

    return Response.json(asset, { status: 201 });
  } catch (error) {
    const message = getErrorMessage(error, "Erro ao criar ativo financeiro");

    console.error("POST /api/finances/assets failed:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    if (typeof body.assetId !== "number") {
      return Response.json({ error: "Ativo invalido." }, { status: 400 });
    }

    if (body.confirm === true) {
      const deletedAsset = await deleteFinanceAsset({
        assetId: body.assetId,
      });

      return Response.json(deletedAsset);
    }

    const preview = await previewFinanceAssetDeletion({
      assetId: body.assetId,
    });

    if (!preview.canDelete) {
      return Response.json(
        {
          ...preview,
          error: "Esse ativo ainda esta sendo usado em movimentacoes.",
        },
        { status: 409 }
      );
    }

    return Response.json(preview);
  } catch (error) {
    const message = getErrorMessage(error, "Erro ao excluir ativo financeiro");

    console.error("DELETE /api/finances/assets failed:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
