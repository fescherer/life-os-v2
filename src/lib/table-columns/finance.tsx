"use client";

import { Button } from "@/components/ui/button";
import { SELECT_OPTIONS } from "@/lib/selects-options";
import { FinanceEntry } from "@/types/finance";
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

function getSelectValue(selectIdentifier: string, id: number) {
  return (
    SELECT_OPTIONS.find(
      (option) =>
        option.selectIdentifier === selectIdentifier && option.id === id,
    )?.value ?? id
  );
}

export const financeEntryColumns: ColumnDef<FinanceEntryRow>[] = [
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
    cell: ({ row }) => getSelectValue("bank", row.original.bank),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => getSelectValue("entry_type", row.original.type),
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
