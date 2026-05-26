"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createReminderEntry } from "@/modules/reminders/actions";
import { ReminderEntryFields } from "@/modules/reminders/components/reminder-entry-fields";
import { SelectOption } from "@/types/select-option";
import { Plus } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";

type ReminderEntryDialogProps = {
  selectOptions: SelectOption[];
};

export function ReminderEntryDialog({ selectOptions }: ReminderEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const hasReminderTypes = useMemo(
    () =>
      selectOptions.some((option) => option.select_identifier === "reminder_type"),
    [selectOptions],
  );

  function submit(formData: FormData) {
    startTransition(async () => {
      try {
        await createReminderEntry(formData);
        setResetKey((current) => current + 1);
        setIsOpen(false);
        toast.success("Reminder added.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not add reminder.",
        );
      }
    });
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button disabled={!hasReminderTypes}>
            <Plus className="size-4" />
            New reminder
          </Button>
        </DialogTrigger>

        {hasReminderTypes ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New reminder</DialogTitle>
              <DialogDescription>
                Add an important date and how often it should notify you.
              </DialogDescription>
            </DialogHeader>
            <form action={submit} className="grid gap-4">
              <ReminderEntryFields
                key={resetKey}
                selectOptions={selectOptions}
                onReadyChange={setIsReady}
              />
              <DialogFooter showCloseButton>
                <Button type="submit" disabled={!isReady || isPending}>
                  {isPending ? "Saving..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        ) : null}
      </Dialog>

      {!hasReminderTypes ? (
        <p className="text-muted-foreground text-sm">
          Add reminder type options in Configuration first.
        </p>
      ) : null}
    </>
  );
}
