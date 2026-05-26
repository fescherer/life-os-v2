import { ExportCsvButton } from "@/components/export-csv-button";
import { getTableRows } from "@/lib/db-fn/get";
import { getSelectOptions } from "@/lib/db-fn/select-options";
import { AssetEntryForm } from "@/modules/assets/components/asset-entry-form";
import { AssetsTable } from "@/modules/assets/components/assets-table";
import { ManageAssetsDialog } from "@/modules/assets/components/manage-assets-dialog";
import { Asset, AssetEntry } from "@/modules/assets/types";

export default async function FinanceAssetsPage() {
  const [assets, assetEntries, selectOptions] = await Promise.all([
    getTableRows<Asset>("assets"),
    getTableRows<AssetEntry>("assets_entries"),
    getSelectOptions(),
  ]);

  return (
    <main className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Finance Assets</h1>
          <p className="text-muted-foreground text-sm">
            Track assets and their transaction history.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <ExportCsvButton data={assetEntries} filename="asset-entries" />
          <ManageAssetsDialog assets={assets} selectOptions={selectOptions} />
          <AssetEntryForm assets={assets} selectOptions={selectOptions} />
        </div>
      </div>

      <AssetsTable
        assets={assets}
        entries={assetEntries}
        selectOptions={selectOptions}
      />
    </main>
  );
}
