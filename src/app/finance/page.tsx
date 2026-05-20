import { DataTable } from "@/components/finance";
import { payments } from "@/lib/data";
import { columns } from "@/lib/data-columns";
import { getTableRows } from "@/lib/db-fn/get";
import { FinanceEntry } from "@/types/finance";

export default async function FinancePage() {

  const financeEntries = await getTableRows<FinanceEntry>(
    "finances_entries"
  );

  console.log(financeEntries)

  return (
    <div className="p-4">
      <DataTable columns={columns} data={payments} />
    </div>
  )
}
