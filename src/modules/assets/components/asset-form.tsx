"use client";

/* eslint-disable react/no-multi-comp */

import { createAsset } from "@/modules/assets/actions";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
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
import { Input } from "@/components/ui/input";
import { Asset } from "@/modules/assets/types";
import { SelectOption } from "@/types/select-option";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type AssetFormProps = {
  selectOptions: SelectOption[];
};

export function AssetForm({ selectOptions }: AssetFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const assetTypes = useMemo(
    () =>
      selectOptions.filter(
        (option) => option.select_identifier === "asset_type",
      ),
    [selectOptions],
  );
  async function submit(formData: FormData) {
    await createAsset(formData);
    setIsOpen(false);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={assetTypes.length === 0}>
            <Plus className="size-4" />
            New asset
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>New asset</DialogTitle>
            <DialogDescription>
              Add the asset once, then reference it in transactions.
            </DialogDescription>
          </DialogHeader>

          <form action={submit} className="grid gap-4">
            <AssetFields selectOptions={selectOptions} />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {assetTypes.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Add asset type options in Configuration first.
        </p>
      ) : null}
    </>
  );
}

export function AssetFields({
  selectOptions,
  defaultAsset,
  onReadyChange,
}: {
  selectOptions: SelectOption[];
  defaultAsset?: Asset;
  onReadyChange?: (ready: boolean) => void;
}) {
  const defaultAssetType = defaultAsset?.asset_type
    ? String(defaultAsset.asset_type)
    : null;
  const [assetType, setAssetType] = useState<string | null>(defaultAssetType);
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const assetTypes = useMemo(
    () =>
      selectOptions.filter(
        (option) => option.select_identifier === "asset_type",
      ),
    [selectOptions],
  );
  const assetTypeItems = useMemo(
    () => assetTypes.map((option) => String(option.id)),
    [assetTypes],
  );

  useEffect(() => {
    onReadyChange?.(!!assetType);
  }, [assetType, onReadyChange]);

  return (
    <div ref={portalContainerRef} className="grid gap-3">
      <label className="block text-sm font-medium">
        Name
        <Input
          name="name"
          defaultValue={defaultAsset?.name}
          className="mt-1"
          required
        />
      </label>

      <label className="block text-sm font-medium">
        Ticker
        <Input
          name="ticker"
          defaultValue={defaultAsset?.ticker}
          className="mt-1 uppercase"
          placeholder="BBSE3"
          required
        />
      </label>

      <div className="block text-sm font-medium">
        <span>Asset type</span>
        <Combobox
          name="asset_type"
          items={assetTypeItems}
          value={assetType}
          onValueChange={setAssetType}
          itemToStringLabel={(value) =>
            assetTypes.find((option) => String(option.id) === value)?.value ?? ""
          }
          required
        >
          <ComboboxInput
            className="mt-1 w-full"
            placeholder="Select asset type"
            showClear
          />
          <ComboboxContent portalContainer={portalContainerRef}>
            <ComboboxEmpty>No asset type found.</ComboboxEmpty>
            <ComboboxList>
              {(value: string) => {
                const option = assetTypes.find(
                  (type) => String(type.id) === value,
                );

                if (!option) {
                  return null;
                }

                return (
                  <ComboboxItem key={option.id} value={value}>
                    <span
                      className="border-border size-3 rounded-full border"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.value}
                  </ComboboxItem>
                );
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
}
