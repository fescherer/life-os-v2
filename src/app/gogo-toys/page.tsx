import { GogoCollectionBoard } from "@/modules/gogo-toys/components/gogo-collection-board";
import { getSelectOptions } from "@/lib/db-fn/select-options";
import {
  getGogoCollections,
  getGogoPurchases,
} from "@/modules/gogo-toys/queries";

export default async function GogoToysPage() {
  const [collections, purchases, selectOptions] = await Promise.all([
    getGogoCollections(),
    getGogoPurchases(),
    getSelectOptions(),
  ]);

  return (
    <main className="grid gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Gogo Toys</h1>
        <p className="text-muted-foreground text-sm">
          Track Gogo collections, quantities, purchases, and store spending.
        </p>
      </div>

      <GogoCollectionBoard
        collections={collections}
        purchases={purchases}
        selectOptions={selectOptions}
      />
    </main>
  );
}
