import { ExportCsvButton } from "@/components/export-csv-button";
import { getTableRows } from "@/lib/db-fn/get";
import { getSelectOptions } from "@/lib/db-fn/select-options";
import { PackagingEntryDialog } from "@/modules/packaging/components/packaging-entry-dialog";
import { PackagingTracker } from "@/modules/packaging/components/packaging-tracker";
import { PackagingEntry } from "@/modules/packaging/types";

export default async function PackagingPage() {
  const [entries, selectOptions] = await Promise.all([
    getTableRows<PackagingEntry>("packaging_tracker"),
    getSelectOptions(),
  ]);

  return (
    <main className="grid gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Packaging Tracker</h1>
          <p className="text-muted-foreground text-sm">
            Track upcoming deliveries, late packages, and delivery history.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <ExportCsvButton data={entries} filename="packaging-tracker" />
          <PackagingEntryDialog selectOptions={selectOptions} />
        </div>
      </div>

      <PackagingTracker entries={entries} selectOptions={selectOptions} />
    </main>
  );
}
