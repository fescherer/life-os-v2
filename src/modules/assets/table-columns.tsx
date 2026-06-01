/* eslint-disable react/no-multi-comp */
"use client";

import { Button } from "@/components/ui/button";
import { AssetEntryRowActions } from "@/modules/assets/components/asset-entry-row-actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Asset, AssetEntry } from "@/modules/assets/types";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export type AssetEntryRow = RowWithId<AssetEntry>;
type AssetRow = RowWithId<Asset>;

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
          <span className="block cursor-default text-center">
            {formatShortDate(value)}
          </span>
        </TooltipTrigger>
        <TooltipContent>{formatFullDate(value)}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 6,
  }).format(value);
}

function getEntryQuantity(entry: AssetEntry) {
  return entry.quantity ?? 1;
}

function getEntryCosts(entry: AssetEntry) {
  return entry.costs ?? 0;
}

function getEntryTotal(entry: AssetEntry) {
  return entry.value * getEntryQuantity(entry) + getEntryCosts(entry);
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

function SelectBadge({
  option,
  fallback,
}: {
  option?: SelectOption;
  fallback: number;
}) {
  if (!option) {
    return <span className="block text-center">{fallback}</span>;
  }

  return (
    <div className="flex justify-center">
      <span
        className="inline-flex h-6 items-center rounded-4xl px-2.5 text-xs font-medium"
        style={{
          backgroundColor: option.color,
          color: getBadgeTextColor(option.color),
        }}
      >
        {option.value}
      </span>
    </div>
  );
}

function SortableHeader({
  column,
  label,
}: {
  column: Column<AssetEntryRow, unknown>;
  label: string;
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
    <div className="flex justify-center">
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

function AssetTickerCell({ asset }: { asset?: AssetRow }) {
  if (!asset) {
    return <span className="text-muted-foreground">Unknown</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="max-w-full cursor-default text-center">
            <p className="truncate font-medium">{asset.ticker}</p>
            <p className="text-muted-foreground truncate text-xs sm:hidden">
              {asset.name}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {asset.ticker}: {asset.name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function getAssetEntryColumns(
  assets: AssetRow[],
  selectOptions: SelectOption[],
): ColumnDef<AssetEntryRow>[] {
  const assetsById = new Map(assets.map((asset) => [String(asset.id), asset]));

  return [
    {
      accessorKey: "date",
      size: 140,
      header: ({ column }) => <SortableHeader column={column} label="Data" />,
      cell: ({ row }) => <DateCell value={row.original.date} />,
    },
    {
      id: "asset_ticker",
      accessorFn: (row) => assetsById.get(String(row.asset_id))?.ticker ?? "",
      size: 130,
      header: ({ column }) => <SortableHeader column={column} label="Ticker" />,
      cell: ({ row }) => (
        <AssetTickerCell asset={assetsById.get(String(row.original.asset_id))} />
      ),
    },
    {
      id: "asset_type",
      accessorFn: (row) =>
        getSelectOptionValue(
          selectOptions,
          "asset_type",
          assetsById.get(String(row.asset_id))?.asset_type ?? 0,
        ),
      size: 150,
      header: ({ column }) => (
        <SortableHeader column={column} label="Tipo de ativo" />
      ),
      cell: ({ row }) => {
        const asset = assetsById.get(String(row.original.asset_id));

        return asset ? (
          <SelectBadge
            option={getSelectOption(
              selectOptions,
              "asset_type",
              asset.asset_type,
            )}
            fallback={asset.asset_type}
          />
        ) : (
          <span className="text-muted-foreground">Unknown</span>
        );
      },
    },
    {
      accessorKey: "value",
      size: 140,
      header: ({ column }) => <SortableHeader column={column} label="Preco" />,
      cell: ({ row }) =>
        Number.isFinite(row.original.value) ? (
          <div className="text-center font-medium">
            {formatCurrency(row.original.value)}
          </div>
        ) : (
          <span className="text-muted-foreground block text-center">
            No value
          </span>
        ),
    },
    {
      accessorKey: "quantity",
      size: 130,
      header: ({ column }) => (
        <SortableHeader column={column} label="Quantidade" />
      ),
      sortingFn: (rowA, rowB) =>
        getEntryQuantity(rowA.original) - getEntryQuantity(rowB.original),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {formatQuantity(getEntryQuantity(row.original))}
        </div>
      ),
    },
    {
      accessorKey: "costs",
      size: 140,
      header: ({ column }) => <SortableHeader column={column} label="Custos" />,
      sortingFn: (rowA, rowB) =>
        getEntryCosts(rowA.original) - getEntryCosts(rowB.original),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {formatCurrency(getEntryCosts(row.original))}
        </div>
      ),
    },
    {
      id: "total",
      accessorFn: (row) => getEntryTotal(row),
      size: 150,
      header: ({ column }) => <SortableHeader column={column} label="Total" />,
      cell: ({ row }) => (
        <div className="text-center font-semibold">
          {formatCurrency(getEntryTotal(row.original))}
        </div>
      ),
    },
    {
      accessorKey: "type",
      size: 170,
      header: ({ column }) => <SortableHeader column={column} label="Tipo" />,
      sortingFn: (rowA, rowB) =>
        getSelectOptionValue(
          selectOptions,
          "asset_entry_type",
          rowA.original.type,
        ).localeCompare(
          getSelectOptionValue(
            selectOptions,
            "asset_entry_type",
            rowB.original.type,
          ),
        ),
      cell: ({ row }) => (
        <SelectBadge
          option={getSelectOption(
            selectOptions,
            "asset_entry_type",
            row.original.type,
          )}
          fallback={row.original.type}
        />
      ),
    },
    {
      id: "actions",
      size: 72,
      enableHiding: false,
      cell: ({ row }) => (
        <AssetEntryRowActions
          assets={assets}
          entry={row.original}
          selectOptions={selectOptions}
        />
      ),
    },
  ];
}
