"use client";

import { DataTable } from "@/components/data-table";
import { openFinanceRowEdit } from "@/modules/finance/components/finance-row-actions";
import { getFinanceEntryColumns } from "@/modules/finance/table-columns";
import { FinanceEntry } from "@/modules/finance/types";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { useMemo } from "react";

type FinanceTableProps = {
  entries: RowWithId<FinanceEntry>[];
  selectOptions: SelectOption[];
};

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
    />
  );
}
