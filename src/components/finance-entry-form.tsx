"use client";

import { createFinanceEntry } from "@/app/finance/actions";
import { FinanceEntryFields } from "@/components/finance-entry-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SelectOption } from "@/types/select-option";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

type FinanceEntryFormProps = {
  selectOptions: SelectOption[];
};

export function FinanceEntryForm({ selectOptions }: FinanceEntryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [resetKey, setResetKey] = useState(0);

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
    setResetKey((current) => current + 1);
    setIsOpen(false);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button disabled={!canCreate}>
            <Plus className="size-4" />
            New finance entry
          </Button>
        </DialogTrigger>

        {canCreate ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New finance entry</DialogTitle>
              <DialogDescription>
                Add an income, expense, or transfer to your finance tracker.
              </DialogDescription>
            </DialogHeader>

            <form action={submit} className="grid gap-4">
              <FinanceEntryFields
                key={resetKey}
                selectOptions={selectOptions}
                onReadyChange={setIsReady}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={!isReady}
                >
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        ) : null}
      </Dialog>

      {!canCreate ? (
        <p className="text-muted-foreground text-sm">
          Add bank and entry type options in Configuration first.
        </p>
      ) : null}
    </>
  );
}
