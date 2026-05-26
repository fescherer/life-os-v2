import { getTableRows } from "@/lib/db-fn/get";
import { getSelectOptions } from "@/lib/db-fn/select-options";
import {
  getGogoCollections,
  getGogoPurchases,
} from "@/modules/gogo-toys/queries";
import { ReminderTypeBadge } from "@/modules/reminders/components/reminder-type-badge";
import {
  getDueReminders,
  getReminderOccurrenceLabel,
} from "@/modules/reminders/recurrence";
import { ReminderEntry } from "@/modules/reminders/types";
import { getWarehouseBoxes } from "@/modules/warehouse/queries";
import {
  Archive,
  BellRing,
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
    href: "/reminders",
    label: "Reminders",
    description: "Recurring dates and alerts",
    icon: BellRing,
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
    reminders,
    selectOptions,
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
    getTableRows<ReminderEntry>("reminders"),
    getSelectOptions(),
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
    ["/reminders", reminders.length],
    ["/gogo-toys", gogoCollections.length + gogoPurchases.length],
    ["/warehouse", warehouseBoxes.reduce(
      (total, box) => total + box.items.length,
      warehouseBoxes.length,
    )],
  ]);
  const dueReminders = getDueReminders(reminders);

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

      <section className="grid gap-3">
        <div>
          <h2 className="text-lg font-semibold">Today&apos;s Reminders</h2>
          <p className="text-muted-foreground text-sm">
            Recurring dates that match today.
          </p>
        </div>

        <div className="border-border bg-card text-card-foreground overflow-hidden rounded-md border">
          {dueReminders.length > 0 ? (
            <div>
              {dueReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="border-border grid gap-2 border-t p-4 first:border-t-0 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-medium">
                        {reminder.description}
                      </h3>
                      <ReminderTypeBadge
                        reminderType={reminder.reminder_type}
                        selectOptions={selectOptions}
                      />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {getReminderOccurrenceLabel(reminder)}
                    </p>
                  </div>
                  <span className="bg-secondary text-secondary-foreground inline-flex h-7 items-center rounded-4xl px-3 text-xs font-medium capitalize">
                    {reminder.notification_frequency}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground p-4 text-sm">
              No reminders for today.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
