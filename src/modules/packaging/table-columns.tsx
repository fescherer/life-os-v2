/* eslint-disable react/no-multi-comp */
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PackagingEntry } from "@/modules/packaging/types";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

export type PackagingEntryRow = RowWithId<PackagingEntry>;

type PackagingColumnsOptions = {
  onDelete: (entry: PackagingEntryRow) => void;
  onEdit: (entry: PackagingEntryRow) => void;
  onToggleArrived: (entry: PackagingEntryRow, hasArrived: boolean) => void;
  selectOptions: SelectOption[];
};

function getOption(
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

function OptionBadge({
  fallback,
  option,
}: {
  fallback: number;
  option?: SelectOption;
}) {
  if (!option) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }

  return (
    <span
      className="inline-flex h-6 max-w-full items-center rounded-4xl px-2.5 text-xs font-medium"
      style={{
        backgroundColor: option.color,
        color: getBadgeTextColor(option.color),
      }}
    >
      <span className="truncate">{option.value}</span>
    </span>
  );
}

function getDateStatus(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      className: "bg-muted-foreground",
      label: "Unknown date",
    };
  }

  const today = new Date();
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dateUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const daysLate = Math.floor((todayUtc - dateUtc) / 86_400_000);

  if (daysLate <= 14) {
    return {
      className: "bg-emerald-500",
      label:
        daysLate <= 0
          ? "On time"
          : `${daysLate} day${daysLate === 1 ? "" : "s"} late`,
    };
  }

  if (daysLate <= 28) {
    return {
      className: "bg-amber-400",
      label: `${daysLate} day${daysLate === 1 ? "" : "s"} late`,
    };
  }

  return {
    className: "bg-red-500",
    label: `${daysLate} days late`,
  };
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function DateCell({
  hasArrived,
  value,
}: {
  hasArrived: boolean;
  value: string;
}) {
  const status = getDateStatus(value);

  if (hasArrived) {
    return (
      <span className="truncate" title={formatDate(value)}>
        {formatDate(value)}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn("size-2.5 shrink-0 rounded-full", status.className)}
        title={status.label}
      />
      <span className="truncate" title={status.label}>
        {formatDate(value)}
      </span>
    </div>
  );
}

function isUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function TrackingCell({ value }: { value: string }) {
  if (!value) {
    return <span className="text-muted-foreground">No tracking</span>;
  }

  if (!isUrl(value)) {
    return <span className="truncate">{value}</span>;
  }

  return (
    <Button asChild variant="link" className="h-auto max-w-full justify-start p-0">
      <a href={value} target="_blank" rel="noreferrer">
        <span className="truncate">Open tracking</span>
        <ExternalLink className="size-3.5" />
      </a>
    </Button>
  );
}

export function getPackagingColumns({
  onDelete,
  onEdit,
  onToggleArrived,
  selectOptions,
}: PackagingColumnsOptions): ColumnDef<PackagingEntryRow>[] {
  return [
    {
      accessorKey: "date",
      size: 150,
      header: "Date",
      cell: ({ row }) => (
        <DateCell
          hasArrived={row.original.has_arrived}
          value={row.original.date}
        />
      ),
    },
    {
      accessorKey: "store",
      size: 140,
      header: "Store",
      cell: ({ row }) => (
        <OptionBadge
          fallback={row.original.store}
          option={getOption(selectOptions, "store", row.original.store)}
        />
      ),
    },
    {
      accessorKey: "description",
      size: 260,
      header: "Description",
      cell: ({ row }) => (
        <div className="truncate" title={row.original.description}>
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "delivery_company",
      size: 170,
      header: "Delivery company",
      cell: ({ row }) => (
        <OptionBadge
          fallback={row.original.delivery_company}
          option={getOption(
            selectOptions,
            "delivery_company",
            row.original.delivery_company,
          )}
        />
      ),
    },
    {
      accessorKey: "tracking",
      size: 170,
      header: "Tracking",
      cell: ({ row }) => <TrackingCell value={row.original.tracking} />,
    },
    {
      accessorKey: "has_arrived",
      size: 110,
      header: "Arrived",
      cell: ({ row }) => (
        <label className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={row.original.has_arrived}
            className="border-input size-4 rounded border"
            onChange={(event) =>
              onToggleArrived(row.original, event.target.checked)
            }
          />
          <span className="sr-only">
            Mark {row.original.description} as arrived
          </span>
        </label>
      ),
    },
    {
      id: "actions",
      size: 84,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(row.original)}
          >
            <span className="sr-only">Edit package</span>
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(row.original)}
          >
            <span className="sr-only">Delete package</span>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}
