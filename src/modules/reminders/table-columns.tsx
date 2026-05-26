/* eslint-disable react/no-multi-comp */
"use client";

import { Button } from "@/components/ui/button";
import {
  ReminderEntry,
  ReminderFrequency,
} from "@/modules/reminders/types";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export type ReminderEntryRow = RowWithId<ReminderEntry>;

const FREQUENCY_LABELS: Record<ReminderFrequency, string> = {
  annual: "Annual",
  monthly: "Monthly",
  weekly: "Weekly",
  daily: "Daily",
};

type ReminderColumnsOptions = {
  onDelete: (entry: ReminderEntryRow) => void;
  onEdit: (entry: ReminderEntryRow) => void;
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

function FrequencyBadge({ value }: { value: ReminderFrequency }) {
  return (
    <span className="bg-secondary text-secondary-foreground inline-flex h-6 max-w-full items-center rounded-4xl px-2.5 text-xs font-medium">
      {FREQUENCY_LABELS[value]}
    </span>
  );
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

export function getReminderColumns({
  onDelete,
  onEdit,
  selectOptions,
}: ReminderColumnsOptions): ColumnDef<ReminderEntryRow>[] {
  return [
    {
      accessorKey: "date",
      size: 150,
      header: "Date",
      cell: ({ row }) => (
        <span className="truncate" title={formatDate(row.original.date)}>
          {formatDate(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: "description",
      size: 300,
      header: "Description",
      cell: ({ row }) => (
        <div className="truncate" title={row.original.description}>
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "reminder_type",
      size: 170,
      header: "Type",
      cell: ({ row }) => (
        <OptionBadge
          fallback={row.original.reminder_type}
          option={getOption(
            selectOptions,
            "reminder_type",
            row.original.reminder_type,
          )}
        />
      ),
    },
    {
      accessorKey: "notification_frequency",
      size: 170,
      header: "Notification frequency",
      cell: ({ row }) => (
        <FrequencyBadge value={row.original.notification_frequency} />
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
            <span className="sr-only">Edit reminder</span>
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(row.original)}
          >
            <span className="sr-only">Delete reminder</span>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}
