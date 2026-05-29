/* eslint-disable react/no-multi-comp */
"use client";

import { DataTable } from "@/components/data-table";
import {
  FinanceRowActions,
  openFinanceRowEdit,
} from "@/modules/finance/components/finance-row-actions";
import { getFinanceEntryColumns } from "@/modules/finance/table-columns";
import { FinanceEntry } from "@/modules/finance/types";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { useMemo } from "react";

type FinanceTableProps = {
  entries: RowWithId<FinanceEntry>[];
  selectOptions: SelectOption[];
};

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
  }).format(new Date(`${value}T00:00:00`));
}

function SelectBadge({
  fallback,
  option,
}: {
  fallback: number;
  option?: SelectOption;
}) {
  if (!option) {
    return <span className="text-muted-foreground text-xs">{fallback}</span>;
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

function FinanceMobileRow({
  entry,
  selectOptions,
}: {
  entry: RowWithId<FinanceEntry>;
  selectOptions: SelectOption[];
}) {
  const bank = getSelectOption(selectOptions, "bank", entry.bank);
  const type = getSelectOption(selectOptions, "entry_type", entry.type);

  return (
    <article
      className="grid gap-3 p-4"
      onDoubleClick={() => openFinanceRowEdit(entry.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex max-w-full flex-wrap items-center gap-2">
            <SelectBadge option={bank} fallback={entry.bank} />
            <SelectBadge option={type} fallback={entry.type} />
          </div>
          <p className="text-muted-foreground text-xs">
            {formatShortDate(entry.date)}
          </p>
        </div>

        <div className="flex shrink-0 items-start gap-1">
          <p className="pt-1 text-right text-sm font-semibold">
            {formatCurrency(entry.amount)}
          </p>
          <FinanceRowActions entry={entry} selectOptions={selectOptions} />
        </div>
      </div>

      <p className="text-sm leading-5 break-words">
        {entry.description || (
          <span className="text-muted-foreground">No description</span>
        )}
      </p>
    </article>
  );
}

export function FinanceTable({ entries, selectOptions }: FinanceTableProps) {
  const columns = useMemo(
    () => getFinanceEntryColumns(selectOptions),
    [selectOptions],
  );

  return (
    <DataTable
      columns={columns}
      data={entries}
      filterColumn="description"
      filterPlaceholder="Filter descriptions..."
      onRowDoubleClick={(entry) => openFinanceRowEdit(entry.id)}
      renderMobileRow={(row) => (
        <FinanceMobileRow
          entry={row.original}
          selectOptions={selectOptions}
        />
      )}
    />
  );
}
