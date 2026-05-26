import { getTableRows } from "@/lib/db-fn/get";
import {
  getGogoCollections,
  getGogoPurchases,
} from "@/modules/gogo-toys/queries";
import { getWarehouseBoxes } from "@/modules/warehouse/queries";
import {
  Archive,
  Boxes,
  CircleDollarSign,
  Clapperboard,
  Landmark,
  LayoutGrid,
  PackageCheck,
} from "lucide-react";
import Link from "next/link";

const overviewCards = [
  {
    href: "/finance",
    label: "Finance",
    description: "Income, expenses, and transfers",
    icon: LayoutGrid,
  },
  {
    href: "/finance-assets",
    label: "Finance Assets",
    description: "Assets and transaction history",
    icon: Landmark,
  },
  {
    href: "/coin-collection",
    label: "Coin Collection",
    description: "Coins catalogued locally",
    icon: CircleDollarSign,
  },
  {
    href: "/reviews",
    label: "Reviews",
    description: "Media reviews and ratings",
    icon: Clapperboard,
  },
  {
    href: "/gogo-toys",
    label: "Gogo Toys",
    description: "Collections and purchases",
    icon: Archive,
  },
  {
    href: "/packaging",
    label: "Packaging",
    description: "Upcoming deliveries and history",
    icon: PackageCheck,
  },
  {
    href: "/warehouse",
    label: "Warehouse",
    description: "Sheets and stored items",
    icon: Boxes,
  },
] as const;

export default async function Home() {
  const [
    financeEntries,
    assets,
    assetEntries,
    coins,
    reviews,
    packagingEntries,
    gogoCollections,
    gogoPurchases,
    warehouseBoxes,
  ] = await Promise.all([
    getTableRows("finances_entries"),
    getTableRows("assets"),
    getTableRows("assets_entries"),
    getTableRows("coin_collection"),
    getTableRows("reviews"),
    getTableRows("packaging_tracker"),
    getGogoCollections(),
    getGogoPurchases(),
    getWarehouseBoxes(),
  ]);

  const counts = new Map<string, number>([
    ["/finance", financeEntries.length],
    ["/finance-assets", assets.length + assetEntries.length],
    ["/coin-collection", coins.length],
    ["/reviews", reviews.length],
    ["/packaging", packagingEntries.length],
    ["/gogo-toys", gogoCollections.length + gogoPurchases.length],
    ["/warehouse", warehouseBoxes.reduce(
      (total, box) => total + box.items.length,
      warehouseBoxes.length,
    )],
  ]);

  return (
    <main className="grid gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Jump into each workspace and see where your data is active.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {overviewCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.href}
              href={card.href}
              className="border-border bg-card text-card-foreground hover:bg-accent grid gap-4 rounded-md border p-4 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="bg-secondary flex size-10 items-center justify-center rounded-md">
                  <Icon className="size-5" />
                </div>
                <span className="text-2xl font-semibold">
                  {counts.get(card.href) ?? 0}
                </span>
              </div>
              <div>
                <h2 className="font-semibold">{card.label}</h2>
                <p className="text-muted-foreground text-sm">
                  {card.description}
                </p>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
