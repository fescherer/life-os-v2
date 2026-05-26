"use client";

/* eslint-disable react/no-multi-comp */

import { createAssetEntry } from "@/modules/assets/actions";
import { Asset, AssetEntry } from "@/modules/assets/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SelectOption } from "@/types/select-option";
import { RowWithId } from "@/types/table";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import {
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type AssetEntryFormProps = {
  assets: RowWithId<Asset>[];
  selectOptions: SelectOption[];
};

function getDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

export function AssetEntryForm({ assets, selectOptions }: AssetEntryFormProps) {
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
        (option) => option.select_identifier === "asset_entry_type",
      ),
    [selectOptions],
  );
  const canCreate =
    assets.length > 0 && banks.length > 0 && entryTypes.length > 0;

  async function submit(formData: FormData) {
    await createAssetEntry(formData);
    setResetKey((current) => current + 1);
    setIsOpen(false);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button disabled={!canCreate}>
            <Plus className="size-4" />
            New asset entry
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>New asset entry</DialogTitle>
            <DialogDescription>
              Register a transaction for one of your saved assets.
            </DialogDescription>
          </DialogHeader>

          <form action={submit} className="grid gap-4">
            <AssetEntryFields
              key={resetKey}
              assets={assets}
              selectOptions={selectOptions}
              onReadyChange={setIsReady}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!isReady}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {!canCreate ? (
        <p className="text-muted-foreground text-sm">
          Add at least one asset, bank, and asset entry type first.
        </p>
      ) : null}
    </>
  );
}

export function AssetEntryFields({
  assets,
  selectOptions,
  defaultEntry,
  onReadyChange,
}: {
  assets: RowWithId<Asset>[];
  selectOptions: SelectOption[];
  defaultEntry?: AssetEntry;
  onReadyChange?: (ready: boolean) => void;
}) {
  const banks = useMemo(
    () =>
      selectOptions.filter((option) => option.select_identifier === "bank"),
    [selectOptions],
  );
  const entryTypes = useMemo(
    () =>
      selectOptions.filter(
        (option) => option.select_identifier === "asset_entry_type",
      ),
    [selectOptions],
  );
  const bankItems = useMemo(() => banks.map((option) => String(option.id)), [banks]);
  const entryTypeItems = useMemo(
    () => entryTypes.map((option) => String(option.id)),
    [entryTypes],
  );
  const assetItems = useMemo(
    () => assets.map((asset) => String(asset.id)),
    [assets],
  );
  const [date, setDate] = useState<Date | undefined>(
    getDate(defaultEntry?.date),
  );
  const [bank, setBank] = useState<string | null>(
    defaultEntry?.bank ? String(defaultEntry.bank) : null,
  );
  const [type, setType] = useState<string | null>(
    defaultEntry?.type ? String(defaultEntry.type) : null,
  );
  const [assetId, setAssetId] = useState<string | null>(
    defaultEntry?.asset_id ? String(defaultEntry.asset_id) : null,
  );
  const portalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onReadyChange?.(!!date && !!bank && !!type && !!assetId);
  }, [assetId, bank, date, onReadyChange, type]);

  return (
    <div ref={portalContainerRef} className="grid gap-3">
      <div className="block text-sm font-medium">
        <span>Date</span>
        <input
          name="date"
          type="hidden"
          value={date ? format(date, "yyyy-MM-dd") : ""}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              data-empty={!date}
              className={cn(
                "mt-1 w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
              )}
            >
              <CalendarIcon className="size-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </PopoverContent>
        </Popover>
      </div>

      <label className="block text-sm font-medium">
        Value
        <Input
          name="value"
          type="number"
          step="0.01"
          defaultValue={defaultEntry?.value}
          className="mt-1"
          required
        />
      </label>

      <OptionCombobox
        label="Bank"
        name="bank"
        placeholder="Select bank"
        options={banks}
        items={bankItems}
        value={bank}
        onValueChange={setBank}
        portalContainerRef={portalContainerRef}
      />

      <OptionCombobox
        label="Type"
        name="type"
        placeholder="Select entry type"
        options={entryTypes}
        items={entryTypeItems}
        value={type}
        onValueChange={setType}
        portalContainerRef={portalContainerRef}
      />

      <div className="block text-sm font-medium">
        <span>Asset</span>
        <Combobox
          name="asset_id"
          items={assetItems}
          value={assetId}
          onValueChange={setAssetId}
          itemToStringLabel={(value) => {
            const asset = assets.find((item) => String(item.id) === value);

            return asset ? `${asset.ticker} - ${asset.name}` : "";
          }}
          required
        >
          <ComboboxInput
            className="mt-1 w-full"
            placeholder="Select asset"
            showClear
          />
          <ComboboxContent portalContainer={portalContainerRef}>
            <ComboboxEmpty>No asset found.</ComboboxEmpty>
            <ComboboxList>
              {(value: string) => {
                const asset = assets.find((item) => String(item.id) === value);

                if (!asset) {
                  return null;
                }

                return (
                  <ComboboxItem key={asset.id} value={value}>
                    <span className="font-medium">{asset.ticker}</span>
                    <span className="text-muted-foreground truncate">
                      {asset.name}
                    </span>
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

function OptionCombobox({
  label,
  name,
  placeholder,
  options,
  items,
  value,
  onValueChange,
  portalContainerRef,
}: {
  label: string;
  name: string;
  placeholder: string;
  options: SelectOption[];
  items: string[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  portalContainerRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="block text-sm font-medium">
      <span>{label}</span>
      <Combobox
        name={name}
        items={items}
        value={value}
        onValueChange={onValueChange}
        itemToStringLabel={(itemValue) =>
          options.find((option) => String(option.id) === itemValue)?.value ?? ""
        }
        required
      >
        <ComboboxInput className="mt-1 w-full" placeholder={placeholder} showClear />
        <ComboboxContent portalContainer={portalContainerRef}>
          <ComboboxEmpty>No option found.</ComboboxEmpty>
          <ComboboxList>
            {(itemValue: string) => {
              const option = options.find(
                (selectOption) => String(selectOption.id) === itemValue,
              );

              if (!option) {
                return null;
              }

              return (
                <ComboboxItem key={option.id} value={itemValue}>
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
  );
}
