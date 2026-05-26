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
import { createPackagingEntry } from "@/modules/packaging/actions";
import { PackagingEntryFields } from "@/modules/packaging/components/packaging-entry-fields";
import { SelectOption } from "@/types/select-option";
import { Plus } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";

type PackagingEntryDialogProps = {
  selectOptions: SelectOption[];
};

export function PackagingEntryDialog({
  selectOptions,
}: PackagingEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const hasStores = useMemo(
    () => selectOptions.some((option) => option.select_identifier === "store"),
    [selectOptions],
  );
  const hasDeliveryCompanies = useMemo(
    () =>
      selectOptions.some(
        (option) => option.select_identifier === "delivery_company",
      ),
    [selectOptions],
  );
  const canCreate = hasStores && hasDeliveryCompanies;

  function submit(formData: FormData) {
    startTransition(async () => {
      try {
        await createPackagingEntry(formData);
        setResetKey((current) => current + 1);
        setIsOpen(false);
        toast.success("Package added.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not add package.",
        );
      }
    });
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button disabled={!canCreate}>
            <Plus className="size-4" />
            New package
          </Button>
        </DialogTrigger>

        {canCreate ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New package</DialogTitle>
              <DialogDescription>
                Track a delivery from store purchase to arrival.
              </DialogDescription>
            </DialogHeader>
            <form action={submit} className="grid gap-4">
              <PackagingEntryFields
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

      {!canCreate ? (
        <p className="text-muted-foreground text-sm">
          Add store and delivery company options in Configuration first.
        </p>
      ) : null}
    </>
  );
}
