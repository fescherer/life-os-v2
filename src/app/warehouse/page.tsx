import { WarehouseBoard } from "@/components/warehouse-board";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { RowWithId } from "@/types/table";
import { WarehouseBox } from "@/types/warehouse";

const WAREHOUSE_TABLE_ID = "warehouse_boxes";

async function getWarehouseBoxes(): Promise<RowWithId<WarehouseBox>[]> {
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

export default async function WarehousePage() {
  const boxes = await getWarehouseBoxes();

  return (
    <main className="grid gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Warehouse</h1>
        <p className="text-muted-foreground text-sm">
          Keep user-created boxes and find where each item is located.
        </p>
      </div>

      <WarehouseBoard boxes={boxes} />
    </main>
  );
}
