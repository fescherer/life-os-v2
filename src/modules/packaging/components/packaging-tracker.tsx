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
import { Input } from "@/components/ui/input";
import {
  deletePackagingEntry,
  updatePackagingArrived,
  updatePackagingEntry,
} from "@/modules/packaging/actions";
import { PackagingEntryFields } from "@/modules/packaging/components/packaging-entry-fields";
import {
  PackagingEntryRow,
  getPackagingColumns,
} from "@/modules/packaging/table-columns";
import { PackagingEntry } from "@/modules/packaging/types";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { Search, X } from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";

type PackagingTrackerProps = {
  entries: RowWithId<PackagingEntry>[];
  selectOptions: SelectOption[];
};

function getOptionText(
  selectOptions: SelectOption[],
  selectIdentifier: string,
  id: number,
) {
  return (
    selectOptions.find(
      (option) =>
        option.select_identifier === selectIdentifier && option.id === id,
    )?.value ?? ""
  );
}

function getSearchText(
  entry: RowWithId<PackagingEntry>,
  selectOptions: SelectOption[],
) {
  return [
    entry.date,
    entry.description,
    entry.tracking,
    entry.has_arrived ? "arrived delivered" : "upcoming pending late",
    getOptionText(selectOptions, "store", entry.store),
    getOptionText(
      selectOptions,
      "delivery_company",
      entry.delivery_company,
    ),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function PackagingTracker({
  entries,
  selectOptions,
}: PackagingTrackerProps) {
  const [query, setQuery] = useState("");
  const [editingEntry, setEditingEntry] =
    useState<RowWithId<PackagingEntry> | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<RowWithId<PackagingEntry> | null>(null);
  const [isEditReady, setIsEditReady] = useState(true);
  const [isPending, startTransition] = useTransition();

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return entries;
    }

    return entries.filter((entry) =>
      getSearchText(entry, selectOptions).includes(normalizedQuery),
    );
  }, [entries, query, selectOptions]);

  const upcomingEntries = useMemo(
    () => filteredEntries.filter((entry) => !entry.has_arrived),
    [filteredEntries],
  );
  const arrivedEntries = useMemo(
    () => filteredEntries.filter((entry) => entry.has_arrived),
    [filteredEntries],
  );

  const handleToggleArrived = useCallback(
    (entry: PackagingEntryRow, hasArrived: boolean) => {
      startTransition(async () => {
        try {
          await updatePackagingArrived(entry.id, hasArrived);
          toast.success(hasArrived ? "Package arrived." : "Package reopened.");
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Could not update package.",
          );
        }
      });
    },
    [startTransition],
  );

  function handleUpdate(formData: FormData) {
    if (!editingEntry) {
      return;
    }

    formData.set("id", editingEntry.id);

    startTransition(async () => {
      try {
        await updatePackagingEntry(formData);
        setEditingEntry(null);
        toast.success("Package updated.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not update package.",
        );
      }
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deletePackagingEntry(deleteTarget.id);
      toast.success("Package deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete package.",
      );
    }
  }

  const columns = useMemo(
    () =>
      getPackagingColumns({
        onDelete: setDeleteTarget,
        onEdit: setEditingEntry,
        onToggleArrived: handleToggleArrived,
        selectOptions,
      }),
    [handleToggleArrived, selectOptions],
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-md">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search packages, stores, companies, tracking..."
            className="pl-9"
          />
        </label>
        <Button
          type="button"
          variant="ghost"
          disabled={!query}
          onClick={() => setQuery("")}
        >
          <X className="size-4" />
          Clear
        </Button>
      </div>

      <section className="grid gap-3">
        <div>
          <h2 className="text-lg font-semibold">Upcoming</h2>
          <p className="text-muted-foreground text-sm">
            Packages that have not arrived yet.
          </p>
        </div>
        <DataTable
          columns={columns}
          data={upcomingEntries}
          minHeightClassName="min-h-[22rem]"
          onRowDoubleClick={setEditingEntry}
        />
      </section>

      <section className="grid gap-3">
        <div>
          <h2 className="text-lg font-semibold">Arrived</h2>
          <p className="text-muted-foreground text-sm">
            Delivery history for packages already received.
          </p>
        </div>
        <DataTable
          columns={columns}
          data={arrivedEntries}
          minHeightClassName="min-h-[22rem]"
          onRowDoubleClick={setEditingEntry}
        />
      </section>

      <Dialog open={Boolean(editingEntry)} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit package</DialogTitle>
            <DialogDescription>
              Update the delivery details or mark the package as arrived.
            </DialogDescription>
          </DialogHeader>
          {editingEntry ? (
            <form action={handleUpdate} className="grid gap-4">
              <PackagingEntryFields
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
        title="Delete package?"
        description="This will permanently delete this packaging tracker entry."
        confirmText="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
