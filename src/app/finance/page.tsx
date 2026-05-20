import { DataTable } from "@/components/data-table";
import { getTableRows } from "@/lib/db-fn/get";
import { financeEntryColumns } from "@/lib/table-columns";
import { FinanceEntry } from "@/types/finance";

export default async function FinancePage() {
  const financeEntries = await getTableRows<FinanceEntry>(
    "finances_entries"
  );

  return (
    <div className="p-4">
      <DataTable
        columns={financeEntryColumns}
        data={financeEntries}
        filterColumn="description"
        filterPlaceholder="Filter descriptions..."
      />
    </div>
  )
}
