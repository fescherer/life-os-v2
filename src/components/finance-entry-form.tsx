/* eslint-disable tailwindcss/no-custom-classname */
"use client";

import { createFinanceEntry } from "@/app/finance/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectOption } from "@/types/select-option";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

type FinanceEntryFormProps = {
  selectOptions: SelectOption[];
};

export function FinanceEntryForm({ selectOptions }: FinanceEntryFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const banks = useMemo(
    () =>
      selectOptions.filter((option) => option.select_identifier === "bank"),
    [selectOptions],
  );
  const entryTypes = useMemo(
    () =>
      selectOptions.filter(
        (option) => option.select_identifier === "entry_type",
      ),
    [selectOptions],
  );
  const canCreate = banks.length > 0 && entryTypes.length > 0;

  async function submit(formData: FormData) {
    await createFinanceEntry(formData);
    setIsOpen(false);
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} disabled={!canCreate}>
        <Plus className="size-4" />
        New finance entry
      </Button>

      {!canCreate ? (
        <p className="text-muted-foreground text-sm">
          Add bank and entry type options in Configuration first.
        </p>
      ) : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <form
            action={submit}
            className="border-border bg-background w-full max-w-md rounded-md border p-4 shadow-lg"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold">New finance entry</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsOpen(false)}
              >
                <span className="sr-only">Close</span>
                <X className="size-4" />
              </Button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="block text-sm font-medium">
                Date
                <Input name="date" type="date" className="mt-1" required />
              </label>

              <label className="block text-sm font-medium">
                Description
                <Input name="description" className="mt-1" required />
              </label>

              <label className="block text-sm font-medium">
                Amount
                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  className="mt-1"
                  required
                />
              </label>

              <label className="block text-sm font-medium">
                Bank
                <select
                  name="bank"
                  className="border-input bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 mt-1 h-9 w-full rounded-4xl border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  required
                >
                  {banks.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.value}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium">
                Type
                <select
                  name="type"
                  className="border-input bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 mt-1 h-9 w-full rounded-4xl border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  required
                >
                  {entryTypes.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.value}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
