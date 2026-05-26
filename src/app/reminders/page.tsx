import { ExportCsvButton } from "@/components/export-csv-button";
import { getTableRows } from "@/lib/db-fn/get";
import { getSelectOptions } from "@/lib/db-fn/select-options";
import { ReminderEntryDialog } from "@/modules/reminders/components/reminder-entry-dialog";
import { RemindersList } from "@/modules/reminders/components/reminders-list";
import { ReminderEntry } from "@/modules/reminders/types";

export default async function RemindersPage() {
  const [reminders, selectOptions] = await Promise.all([
    getTableRows<ReminderEntry>("reminders"),
    getSelectOptions(),
  ]);

  return (
    <main className="grid gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Reminders</h1>
          <p className="text-muted-foreground text-sm">
            Keep recurring dates visible on your overview.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <ExportCsvButton data={reminders} filename="reminders" />
          <ReminderEntryDialog selectOptions={selectOptions} />
        </div>
      </div>

      <RemindersList reminders={reminders} selectOptions={selectOptions} />
    </main>
  );
}
