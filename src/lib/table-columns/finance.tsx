"use client";

import { Button } from "@/components/ui/button";
import { FinanceEntry } from "@/types/finance";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { createActionsColumn } from "./actions";

export type FinanceEntryRow = RowWithId<FinanceEntry>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getSelectValue(
  selectOptions: SelectOption[],
  selectIdentifier: string,
  id: number,
) {
  return (
    selectOptions.find(
      (option) =>
        option.select_identifier === selectIdentifier && option.id === id,
    )?.value ?? id
  );
}

export function getFinanceEntryColumns(
  selectOptions: SelectOption[],
): ColumnDef<FinanceEntryRow>[] {
  return [
    {
      accessorKey: "date",
      header: "Data",
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Descricao
          <ArrowUpDown />
        </Button>
      ),
    },
    {
      accessorKey: "bank",
      header: "Banco",
      cell: ({ row }) =>
        getSelectValue(selectOptions, "bank", row.original.bank),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) =>
        getSelectValue(selectOptions, "entry_type", row.original.type),
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Valor</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.original.amount)}
        </div>
      ),
    },
    createActionsColumn<FinanceEntryRow>(),
  ];
}
