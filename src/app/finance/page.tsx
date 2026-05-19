import { DataTable } from "@/components/finance";
import { payments } from "@/lib/data";
import { columns } from "@/lib/data-columns";

export default function FinancePage() {
  return (
    <div className="p-4">
      <DataTable columns={columns} data={payments} />
    </div>
  )
}