"use client";

/* eslint-disable react/no-multi-comp */

import {
  createAsset,
  deleteAsset,
  updateAsset,
} from "@/modules/assets/actions";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { AssetFields } from "@/modules/assets/components/asset-form";
import { Asset } from "@/modules/assets/types";
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
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { Pencil, Plus, Settings2, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

type ManageAssetsDialogProps = {
  assets: RowWithId<Asset>[];
  selectOptions: SelectOption[];
};

function getAssetTypeOption(selectOptions: SelectOption[], id: number) {
  return selectOptions.find(
    (option) =>
      option.select_identifier === "asset_type" && option.id === id,
  );
}

function getBadgeTextColor(color: string) {
  const hex = color.replace("#", "");

  if (hex.length !== 6) {
    return "currentColor";
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.6 ? "#18181b" : "#fafafa";
}

function AssetTypeBadge({
  option,
  fallback,
}: {
  option?: SelectOption;
  fallback: number;
}) {
  if (!option) {
    return <span className="text-muted-foreground text-sm">{fallback}</span>;
  }

  return (
    <span
      className="inline-flex h-6 items-center rounded-4xl px-2.5 text-xs font-medium"
      style={{
        backgroundColor: option.color,
        color: getBadgeTextColor(option.color),
      }}
    >
      {option.value}
    </span>
  );
}

export function ManageAssetsDialog({
  assets,
  selectOptions,
}: ManageAssetsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RowWithId<Asset> | null>(null);
  const assetTypes = useMemo(
    () =>
      selectOptions.filter(
        (option) => option.select_identifier === "asset_type",
      ),
    [selectOptions],
  );

  async function addAsset(formData: FormData) {
    await createAsset(formData);
    setIsAdding(false);
  }

  async function editAsset(formData: FormData) {
    await updateAsset(formData);
    setEditingAssetId(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    await deleteAsset(deleteTarget.id);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={assetTypes.length === 0}>
            <Settings2 className="size-4" />
            Manage assets
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage assets</DialogTitle>
            <DialogDescription>
              Add, edit, or remove the assets used by asset entries.
            </DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1">
            {isAdding ? (
              <form action={addAsset} className="rounded-md border p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">New asset</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setIsAdding(false)}
                  >
                    <span className="sr-only">Cancel new asset</span>
                    <X />
                  </Button>
                </div>
                <AssetFields selectOptions={selectOptions} />
                <DialogFooter className="mt-4">
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="justify-self-start"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="size-4" />
                Add asset
              </Button>
            )}

            <div className="overflow-hidden rounded-md border">
              {assets.length ? (
                assets.map((asset) =>
                  editingAssetId === asset.id ? (
                    <form
                      key={asset.id}
                      action={editAsset}
                      className="border-border border-b p-3 last:border-b-0"
                    >
                      <input type="hidden" name="id" value={asset.id} />
                      <AssetFields
                        key={asset.id}
                        selectOptions={selectOptions}
                        defaultAsset={asset}
                      />
                      <DialogFooter className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingAssetId(null)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                      </DialogFooter>
                    </form>
                  ) : (
                    <div
                      key={asset.id}
                      className="border-border flex flex-col gap-3 border-b p-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <p className="font-medium">{asset.ticker}</p>
                          <AssetTypeBadge
                            option={getAssetTypeOption(
                              selectOptions,
                              asset.asset_type,
                            )}
                            fallback={asset.asset_type}
                          />
                        </div>
                        <p className="text-muted-foreground truncate text-sm">
                          {asset.name}
                        </p>
                      </div>

                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingAssetId(asset.id)}
                        >
                          <span className="sr-only">Edit {asset.ticker}</span>
                          <Pencil />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(asset)}
                        >
                          <span className="sr-only">Delete {asset.ticker}</span>
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="text-muted-foreground px-4 py-8 text-center text-sm">
                  No assets yet.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {assetTypes.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Add asset type options in Configuration first.
        </p>
      ) : null}

      <ConfirmationDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Delete asset?"
        description="This will permanently delete the asset and its asset entries."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}
