/* eslint-disable react/no-multi-comp */
"use client";

import { Button } from "@/components/ui/button";
import { FinanceRowActions } from "@/modules/finance/components/finance-row-actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FinanceEntry } from "@/modules/finance/types";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

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

function getSelectOptionValue(
  selectOptions: SelectOption[],
  selectIdentifier: string,
  id: number,
) {
  return getSelectOption(selectOptions, selectIdentifier, id)?.value ?? "";
}

function SortableHeader({
  column,
  label,
  align = "left",
}: {
  column: Column<FinanceEntryRow, unknown>;
  label: string;
  align?: "left" | "right" | "center";
}) {
  const sortDirection = column.getIsSorted();
  const sortIndex = column.getSortIndex();
  const SortIcon =
    sortDirection === "asc"
      ? ArrowUp
      : sortDirection === "desc"
        ? ArrowDown
        : ArrowUpDown;

  return (
    <div className={cn("flex", align === "right" && "justify-end")}>
      <Button
        variant="ghost"
        size="sm"
        onClick={column.getToggleSortingHandler()}
        className={cn(
          "-mx-2 px-2",
          sortDirection && "text-primary hover:text-primary",
        )}
      >
        {label}
        <SortIcon
          className={cn(sortDirection ? "text-primary" : "text-muted-foreground")}
        />
        {sortIndex > -1 ? (
          <span className="bg-primary/10 text-primary flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
            {sortIndex + 1}
          </span>
        ) : null}
      </Button>
    </div>
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
      size: 140,
      header: ({ column }) => (
        <SortableHeader column={column} label="Data" />
      ),
      cell: ({ row }) => <DateCell value={row.original.date} />,
    },
    {
      accessorKey: "bank",
      size: 150,
      header: ({ column }) => (
        <SortableHeader column={column} label="Banco" />
      ),
      sortingFn: (rowA, rowB) =>
        getSelectOptionValue(
          selectOptions,
          "bank",
          rowA.original.bank,
        ).localeCompare(
          getSelectOptionValue(selectOptions, "bank", rowB.original.bank),
        ),
      cell: ({ row }) => (
        <SelectBadge
          option={getSelectOption(selectOptions, "bank", row.original.bank)}
          fallback={row.original.bank}
        />
      ),
    },
    {
      accessorKey: "type",
      size: 150,
      header: ({ column }) => (
        <SortableHeader column={column} label="Tipo"  />
      ),
      sortingFn: (rowA, rowB) =>
        getSelectOptionValue(
          selectOptions,
          "entry_type",
          rowA.original.type,
        ).localeCompare(
          getSelectOptionValue(
            selectOptions,
            "entry_type",
            rowB.original.type,
          ),
        ),
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
      size: 140,
      header: ({ column }) => (
        <SortableHeader column={column} label="Valor" align="right" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.original.amount)}
        </div>
      ),
    },
    {
      accessorKey: "description",
      size: 360,
      header: ({ column }) => (
        <SortableHeader column={column} label="Descricao" align="right" />
      ),
      cell: ({ row }) => (
        <div
          dir="rtl"
          className="max-w-full truncate text-right"
          title={row.original.description}
        >
          {row.original.description}
        </div>
      ),
    },
    {
      id: "actions",
      size: 72,
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
