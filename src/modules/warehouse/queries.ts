import { createSupabaseServerClient } from "@/lib/supabase-server";
import { RowWithId } from "@/types/table";
import { WarehouseBox } from "@/modules/warehouse/types";

const WAREHOUSE_TABLE_ID = "warehouse_boxes";

export async function getWarehouseBoxes(): Promise<RowWithId<WarehouseBox>[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_data")
    .select("*")
    .eq("table_id", WAREHOUSE_TABLE_ID)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  return (
    data?.map((row) => ({
      id: row.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      ...(row.data as WarehouseBox),
    })) ?? []
  );
}
