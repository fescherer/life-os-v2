/* eslint-disable react/no-multi-comp */
"use client";

import { Button } from "@/components/ui/button";
import { FinanceRowActions } from "@/components/finance-row-actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FinanceEntry } from "@/types/finance";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export type FinanceEntryRow = RowWithId<FinanceEntry>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
  }).format(getDate(value));
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
  }).format(getDate(value));
}

function DateCell({ value }: { value: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default">
            {formatShortDate(value)}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {formatFullDate(value)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getSelectOption(
  selectOptions: SelectOption[],
  selectIdentifier: string,
  id: number,
) {
  return selectOptions.find(
    (option) =>
      option.select_identifier === selectIdentifier && option.id === id,
  );
}

function getBadgeTextColor(color: string) {
  const hex = color.replace("#", "");

  if (hex.length !== 6) {
    return "currentColor";
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.6 ? "#18181b" : "#fafafa";
}

function SelectBadge({ option, fallback }: {
  option?: SelectOption;
  fallback: number;
}) {
  if (!option) {
    return <span>{fallback}</span>;
  }

  return (
    <span
      className="inline-flex h-6 items-center rounded-4xl px-2.5 text-xs font-medium"
      style={{
        backgroundColor: option.color,
        color: getBadgeTextColor(option.color),
      }}
    >
      {option.value}
    </span>
  );
}

export function getFinanceEntryColumns(
  selectOptions: SelectOption[],
): ColumnDef<FinanceEntryRow>[] {
  return [
    {
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) => <DateCell value={row.original.date} />,
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
      cell: ({ row }) => (
        <SelectBadge
          option={getSelectOption(selectOptions, "bank", row.original.bank)}
          fallback={row.original.bank}
        />
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <SelectBadge
          option={getSelectOption(
            selectOptions,
            "entry_type",
            row.original.type,
          )}
          fallback={row.original.type}
        />
      ),
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
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <FinanceRowActions
          entry={row.original}
          selectOptions={selectOptions}
        />
      ),
    },
  ];
}
