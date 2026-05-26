import { createSupabaseServerClient } from "@/lib/supabase-server";
import { RowWithId } from "@/types/table";
import { GogoCollection, GogoPurchase } from "@/modules/gogo-toys/types";

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

export function getGogoCollections() {
  return getAppDataRows<GogoCollection>(GOGO_COLLECTIONS_TABLE_ID);
}

export function getGogoPurchases() {
  return getAppDataRows<GogoPurchase>(GOGO_PURCHASES_TABLE_ID);
}
