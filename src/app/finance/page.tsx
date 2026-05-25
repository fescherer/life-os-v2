import { ExportCsvButton } from "@/components/export-csv-button";
import { FinanceEntryForm } from "@/components/finance-entry-form";
import { FinanceTable } from "@/components/finance-table";
import { getSelectOptions } from "@/lib/db-fn/select-options";
import { getTableRows } from "@/lib/db-fn/get";
import { FinanceEntry } from "@/types/finance";

export default async function FinancePage() {
  const [financeEntries, selectOptions] = await Promise.all([
    getTableRows<FinanceEntry>("finances_entries"),
    getSelectOptions(),
  ]);

  return (
    <main className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Finance</h1>
          <p className="text-muted-foreground text-sm">
            Track income, expenses, and transfers.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <ExportCsvButton data={financeEntries} filename="finance" />
          <FinanceEntryForm selectOptions={selectOptions} />
        </div>
      </div>

      <FinanceTable entries={financeEntries} selectOptions={selectOptions} />
    </main>
  )
}
