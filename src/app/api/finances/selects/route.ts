import {
  createFinanceSelectOption,
  deleteFinanceSelectOption,
  getFinanceSelects,
  previewFinanceSelectOptionDeletion,
} from "@/queries/finances/selects";
import { FINANCE_SELECT_NAMES, type FinanceSelectName } from "@/types/finance-selects";

function isFinanceSelectName(value: string): value is FinanceSelectName {
  return Object.values(FINANCE_SELECT_NAMES).includes(value as FinanceSelectName);
}

export async function GET() {
  try {
    const selects = await getFinanceSelects();

    return Response.json(selects);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar selects financeiros";

    console.error("GET /api/finances/selects failed:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isFinanceSelectName(body.selectName)) {
      return Response.json({ error: "Select inválido." }, { status: 400 });
    }

    const option = await createFinanceSelectOption({
      selectName: body.selectName,
      label: body.label,
    });

    return Response.json(option, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar opção financeira";

    console.error("POST /api/finances/selects failed:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    if (!isFinanceSelectName(body.selectName)) {
      return Response.json({ error: "Select invalido." }, { status: 400 });
    }

    if (typeof body.optionId !== "number") {
      return Response.json({ error: "Opcao invalida." }, { status: 400 });
    }

    if (body.confirm === true) {
      const deletedOption = await deleteFinanceSelectOption({
        selectName: body.selectName,
        optionId: body.optionId,
        replacementOptionId:
          typeof body.replacementOptionId === "number"
            ? body.replacementOptionId
            : undefined,
      });

      return Response.json(deletedOption);
    }

    const preview = await previewFinanceSelectOptionDeletion({
      selectName: body.selectName,
      optionId: body.optionId,
    });

    if (!preview.canDelete) {
      return Response.json(
        {
          ...preview,
          error: "Essa opcao ainda esta sendo usada em outros lancamentos.",
        },
        { status: 409 }
      );
    }

    return Response.json(preview);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir opcao financeira";

    console.error("DELETE /api/finances/selects failed:", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
