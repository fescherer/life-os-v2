import { WarehouseBoard } from "@/modules/warehouse/components/warehouse-board";
import { getWarehouseBoxes } from "@/modules/warehouse/queries";

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
