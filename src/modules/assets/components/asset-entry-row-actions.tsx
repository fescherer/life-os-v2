"use client";

import {
  deleteAssetEntry,
  updateAssetEntry,
} from "@/modules/assets/actions";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { AssetEntryFields } from "@/modules/assets/components/asset-entry-form";
import { Asset, AssetEntry } from "@/modules/assets/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AssetEntryRowActionsProps = {
  assets: RowWithId<Asset>[];
  entry: RowWithId<AssetEntry>;
  selectOptions: SelectOption[];
};

type ConfirmationAction = "save" | "delete";

const ASSET_ENTRY_ROW_EDIT_EVENT = "asset-entry-row-edit";

export function openAssetEntryRowEdit(entryId: string) {
  window.dispatchEvent(
    new CustomEvent<{ entryId: string }>(ASSET_ENTRY_ROW_EDIT_EVENT, {
      detail: { entryId },
    }),
  );
}

export function AssetEntryRowActions({
  assets,
  entry,
  selectOptions,
}: AssetEntryRowActionsProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditReady, setIsEditReady] = useState(true);
  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction | null>(null);

  useEffect(() => {
    function handleEditEvent(event: Event) {
      if (!(event instanceof CustomEvent)) {
        return;
      }

      if (event.detail?.entryId === entry.id) {
        setIsEditOpen(true);
      }
    }

    window.addEventListener(ASSET_ENTRY_ROW_EDIT_EVENT, handleEditEvent);

    return () => {
      window.removeEventListener(ASSET_ENTRY_ROW_EDIT_EVENT, handleEditEvent);
    };
  }, [entry.id]);

  async function submit(formData: FormData) {
    await updateAssetEntry(formData);
    setIsEditOpen(false);
  }

  function confirmSave() {
    if (!formRef.current?.reportValidity()) {
      return;
    }

    setConfirmationAction("save");
  }

  async function confirmAction() {
    if (confirmationAction === "save") {
      formRef.current?.requestSubmit();
      return;
    }

    await deleteAssetEntry(entry.id);
  }

  const confirmation =
    confirmationAction === "save"
      ? {
        title: "Save asset entry?",
        description: "Confirm that you want to update this asset entry.",
        confirmText: "Save",
        variant: "default" as const,
      }
      : {
        title: "Delete asset entry?",
        description: "This will permanently delete this asset entry.",
        confirmText: "Delete",
        variant: "destructive" as const,
      };

  return (
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="ml-auto flex">
            <span className="sr-only">Open row actions</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setConfirmationAction("delete")}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit asset entry</DialogTitle>
          <DialogDescription>
            Update the saved transaction details.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={submit} className="grid gap-4">
          <input type="hidden" name="id" value={entry.id} />

          <AssetEntryFields
            assets={assets}
            selectOptions={selectOptions}
            defaultEntry={entry}
            onReadyChange={setIsEditReady}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={confirmSave} disabled={!isEditReady}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <ConfirmationDialog
        open={confirmationAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmationAction(null);
          }
        }}
        title={confirmation.title}
        description={confirmation.description}
        confirmText={confirmation.confirmText}
        cancelText="Cancel"
        variant={confirmation.variant}
        onConfirm={confirmAction}
      />
    </Dialog>
  );
}
