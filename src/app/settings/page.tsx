import { SelectOptionsConfig } from "@/components/select-options-config";
import { getSelectOptions } from "@/lib/db-fn/select-options";

export default async function SettingsPage() {
  const selectOptions = await getSelectOptions();

  return (
    <main className="p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Configuration</h1>
          <p className="text-muted-foreground text-sm">
            Manage the options used by select fields across your tables.
          </p>
        </div>

        <SelectOptionsConfig options={selectOptions} />
      </div>
    </main>
  );
}
