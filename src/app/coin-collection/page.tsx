import { CoinCollectionGrid } from "@/components/coin-collection-grid";
import { CoinCreateDialog } from "@/components/coin-create-dialog";
import { CoinStatsDialog } from "@/components/coin-stats-dialog";
import { ExportCsvButton } from "@/components/export-csv-button";
import { getTableRows } from "@/lib/db-fn/get";
import { Coin } from "@/types/coin";

export default async function CoinCollectionPage() {
  const coins = await getTableRows<Coin>("coin_collection");

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
          <CoinCreateDialog />
        </div>
      </div>

      {coins.length > 0 ? (
        <CoinCollectionGrid coins={coins} />
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
