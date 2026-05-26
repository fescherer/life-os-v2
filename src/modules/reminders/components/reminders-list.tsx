"use client";

import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deleteReminderEntry,
  updateReminderEntry,
} from "@/modules/reminders/actions";
import { ReminderEntryFields } from "@/modules/reminders/components/reminder-entry-fields";
import {
  ReminderEntryRow,
  getReminderColumns,
} from "@/modules/reminders/table-columns";
import { ReminderEntry } from "@/modules/reminders/types";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";

type RemindersListProps = {
  reminders: RowWithId<ReminderEntry>[];
  selectOptions: SelectOption[];
};

export function RemindersList({ reminders, selectOptions }: RemindersListProps) {
  const [editingEntry, setEditingEntry] =
    useState<RowWithId<ReminderEntry> | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<RowWithId<ReminderEntry> | null>(null);
  const [isEditReady, setIsEditReady] = useState(true);
  const [isPending, startTransition] = useTransition();

  const columns = useMemo(
    () =>
      getReminderColumns({
        onDelete: setDeleteTarget,
        onEdit: setEditingEntry,
        selectOptions,
      }),
    [selectOptions],
  );

  function handleUpdate(formData: FormData) {
    if (!editingEntry) {
      return;
    }

    formData.set("id", editingEntry.id);

    startTransition(async () => {
      try {
        await updateReminderEntry(formData);
        setEditingEntry(null);
        toast.success("Reminder updated.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not update reminder.",
        );
      }
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteReminderEntry(deleteTarget.id);
      toast.success("Reminder deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete reminder.",
      );
    }
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={reminders}
        filterColumn="description"
        filterPlaceholder="Search reminders..."
        onRowDoubleClick={(row: ReminderEntryRow) => setEditingEntry(row)}
      />

      <Dialog open={Boolean(editingEntry)} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit reminder</DialogTitle>
            <DialogDescription>
              Update the date, type, description, or notification frequency.
            </DialogDescription>
          </DialogHeader>
          {editingEntry ? (
            <form action={handleUpdate} className="grid gap-4">
              <ReminderEntryFields
                defaultEntry={editingEntry}
                selectOptions={selectOptions}
                onReadyChange={setIsEditReady}
              />
              <DialogFooter showCloseButton>
                <Button type="submit" disabled={!isEditReady || isPending}>
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Delete reminder?"
        description="This will permanently delete this reminder."
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}
