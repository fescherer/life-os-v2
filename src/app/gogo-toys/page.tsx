import { GogoCollectionBoard } from "@/components/gogo-collection-board";
import { getSelectOptions } from "@/lib/db-fn/select-options";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { GogoCollection, GogoPurchase } from "@/types/gogo";
import { RowWithId } from "@/types/table";

const GOGO_COLLECTIONS_TABLE_ID = "gogo_collections";
const GOGO_PURCHASES_TABLE_ID = "gogo_purchases";

async function getAppDataRows<T>(tableId: string): Promise<RowWithId<T>[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_data")
    .select("*")
    .eq("table_id", tableId)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return (
    data?.map((row) => ({
      id: row.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      ...(row.data as T),
    })) ?? []
  );
}

export default async function GogoToysPage() {
  const [collections, purchases, selectOptions] = await Promise.all([
    getAppDataRows<GogoCollection>(GOGO_COLLECTIONS_TABLE_ID),
    getAppDataRows<GogoPurchase>(GOGO_PURCHASES_TABLE_ID),
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
