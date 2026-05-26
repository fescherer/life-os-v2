import { CoinCollectionGrid } from "@/modules/coin-collection/components/coin-collection-grid";
import { CoinCreateDialog } from "@/modules/coin-collection/components/coin-create-dialog";
import { CoinStatsDialog } from "@/modules/coin-collection/components/coin-stats-dialog";
import { ExportCsvButton } from "@/components/export-csv-button";
import { getTableRows } from "@/lib/db-fn/get";
import { getSelectOptions } from "@/lib/db-fn/select-options";
import { Coin } from "@/modules/coin-collection/types";

export default async function CoinCollectionPage() {
  const [coins, selectOptions] = await Promise.all([
    getTableRows<Coin>("coin_collection"),
    getSelectOptions(),
  ]);

  return (
    <main className="grid gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Coin Collection</h1>
          <p className="text-muted-foreground text-sm">
            Track coins locally and jump to Numista when you want richer details.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportCsvButton
            data={coins}
            excludeColumns={["material", "isCommemorative"]}
            filename="coin-collection"
          />
          <CoinStatsDialog coins={coins} />
          <CoinCreateDialog selectOptions={selectOptions} />
        </div>
      </div>

      {coins.length > 0 ? (
        <CoinCollectionGrid coins={coins} selectOptions={selectOptions} />
      ) : (
        <section className="border-border grid min-h-64 place-items-center rounded-md border border-dashed p-8 text-center">
          <div>
            <h2 className="font-semibold">No coins yet</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Add your first coin with a year, family, name, and image.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
